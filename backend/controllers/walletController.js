const db = require('../config/db');

const getActiveMealInfo = () => {
    // 1. Get exact current time in Asia/Kolkata timezone
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour12: false });
    
    // Extract the hour and minute (e.g., 14:30 becomes 14.5 for easy math)
    const timeParts = istString.split(', ')[1].split(':');
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);
    const currentTime = hour + (minute / 60);

    // 2. Map time ranges to meals and prices
    // Format: 24-hour clock. 7.0 is 7:00 AM, 15.5 is 3:30 PM.
    if (currentTime >= 7.0 && currentTime < 10.5) {
        return { meal_type: 'Breakfast', price: 60.00 };
    } 
    else if (currentTime >= 12.0 && currentTime < 15.0) {
        return { meal_type: 'Lunch', price: 60.00 };
    } 
    else if (currentTime >= 16.0 && currentTime < 18.5) {
        return { meal_type: 'Snacks', price: 40.00 };
    } 
    else if (currentTime >= 19.5 && currentTime < 22.5) {
        return { meal_type: 'Dinner', price: 60.00 };
    }
    
    // If scanned outside these hours, return null (Mess is closed)
    return null; 
};

// --- 1. GET CURRENT BALANCE ---
exports.getBalance = async (req, res) => {
    try {
        // req.user.id comes from the JWT security guard we built earlier
        const [wallet] = await db.query('SELECT balance FROM wallets WHERE user_id = ?', [req.user.id]);
        
        if (wallet.length === 0) {
            return res.status(404).json({ success: false, message: "Wallet not found." });
        }

        res.status(200).json({ success: true, balance: wallet[0].balance });
    } catch (error) {
        console.error("Balance Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching balance." });
    }
};

// --- PREVIEW THE MEAL (For the "Confirmation" Screen) ---
exports.scanPreview = async (req, res) => {
    const mealInfo = getActiveMealInfo();
    
    if (!mealInfo) {
        return res.status(400).json({ success: false, message: "The mess is currently closed." });
    }

    res.status(200).json({ 
        success: true, 
        message: "Confirm your payment",
        meal: mealInfo.meal_type,
        amount: mealInfo.price
    });
};

// --- PROCESS THE PAYMENT (Dynamic Deduction) ---
exports.processPayment = async (req, res) => {
    const { mess_id } = req.body; // Notice we NO LONGER accept 'amount' from the client
    const student_id = req.user.id;

    // 1. Calculate price securely on the server
    const mealInfo = getActiveMealInfo();
    if (!mealInfo) {
        return res.status(400).json({ success: false, message: "Payment failed: The mess is currently closed." });
    }

    const amount = mealInfo.price;
    const meal_type = mealInfo.meal_type;

    const connection = await db.getConnection(); 

    try {
        await connection.beginTransaction();

        // 2. Check balance and lock row
        const [wallet] = await connection.query('SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE', [student_id]);
        
        if (wallet.length === 0 || wallet[0].balance < amount) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ success: false, message: `Insufficient tokens! You need ₹${amount} for ${meal_type}.` });
        }

        // 3. Deduct the exact calculated amount
        const newBalance = wallet[0].balance - amount;
        await connection.query('UPDATE wallets SET balance = ? WHERE user_id = ?', [newBalance, student_id]);

        // 4. Write the receipt, saving the meal_type as the transaction context
        await connection.query(
            'INSERT INTO transactions (user_id, mess_id, amount, type) VALUES (?, ?, ?, ?)', 
            [student_id, `${mess_id}_${meal_type}`, amount, 'deduction']
        );

        await connection.commit();
        connection.release();

        res.status(200).json({ 
            success: true, 
            message: `Paid ₹${amount} for ${meal_type}!`, 
            newBalance: newBalance 
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ success: false, message: "Transaction failed." });
    }
};

// --- 4. GET STUDENT TRANSACTION HISTORY ---
exports.getMyHistory = async (req, res) => {
    try {
        const [history] = await db.query(
            `SELECT 
                amount, 
                type, 
                mess_id, 
                DATE_FORMAT(created_at, '%d %b, %h:%i %p') as formatted_date 
             FROM transactions 
             WHERE user_id = ? 
             ORDER BY created_at DESC`, 
            [req.user.id]
        );
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch history." });
    }
};

const jwt = require('jsonwebtoken');

// --- GENERATE SECURE QR CODE ---
exports.generateQR = async (req, res) => {
    try {
        const mealInfo = getActiveMealInfo(); // Uses your existing time-check logic
        
        if (!mealInfo) {
            return res.status(400).json({ success: false, message: "The mess is currently closed." });
        }

        // Create a token that DIES in 30 seconds
        const qrPayload = jwt.sign(
            { 
                student_id: req.user.id, 
                meal_type: mealInfo.meal_type, 
                price: mealInfo.price 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30s' } 
        );

        res.status(200).json({ 
            success: true, 
            qrString: qrPayload, 
            meal: mealInfo.meal_type,
            expiresIn: 30
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Could not generate QR" });
    }
};

// --- PROCESS SCANNED QR CODE (Admin Only) ---
exports.verifyScan = async (req, res) => {
    const { qr_token, mess_id } = req.body;

    try {
        // 1. Verify the Cryptographic Signature & Expiration
        // If it's older than 30 seconds, jwt.verify automatically throws an error
        const decoded = jwt.verify(qr_token, process.env.JWT_SECRET);
        
        const { student_id, meal_type, price } = decoded;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction(); // Start ACID Transaction

            // 2. Lock the row and check balance
            const [wallet] = await connection.query('SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE', [student_id]);
            
            if (wallet.length === 0 || wallet[0].balance < price) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ success: false, message: "Insufficient tokens!" });
            }

            // 3. Deduct funds and log the transaction
            const newBalance = wallet[0].balance - price;
            await connection.query('UPDATE wallets SET balance = ? WHERE user_id = ?', [newBalance, student_id]);
            await connection.query(
                'INSERT INTO transactions (user_id, mess_id, amount, type) VALUES (?, ?, ?, ?)', 
                [student_id, `${mess_id}_${meal_type}`, price, 'deduction']
            );

            await connection.commit();
            connection.release();

            res.status(200).json({ success: true, message: `Successfully deducted ₹${price} for ${meal_type}.` });

        } catch (dbError) {
            await connection.rollback();
            connection.release();
            throw dbError; // Pass to outer catch
        }

    } catch (error) {
        // If jwt.verify fails, it lands here
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ success: false, message: "QR Code Expired. Ask student to refresh." });
        }
        res.status(400).json({ success: false, message: "Invalid QR Code." });
    }
};

exports.selfRecharge = async (req, res) => {
    const { amount } = req.body;
    try {
        const userId = req.user.id; // From verifyToken middleware
        
        // 1. Update the balance
        await db.query('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [amount, userId]);
        
        // 2. Log the transaction as a 'topup'
        await db.query(
            'INSERT INTO transactions (user_id, amount, type, mess_id) VALUES (?, ?, ?, ?)', 
            [userId, amount, 'topup', 'SELF_RECHARGE']
        );

        res.status(200).json({ success: true, message: `₹${amount} added successfully!` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Transaction failed." });
    }
};