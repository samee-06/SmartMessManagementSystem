const db = require('../config/db');

// --- 1. GET ALL TRANSACTIONS (Admin Only) ---
exports.getAllTransactions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.id, u.name as student_name, t.amount, t.type, t.created_at 
            FROM transactions t 
            JOIN users u ON t.user_id = u.id 
            ORDER BY t.created_at DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching logs" });
    }
};

// --- 2. TOP UP WALLET (Admin Only) ---
exports.topupWallet = async (req, res) => {
    const { email, amount } = req.body;
    try {
        // Find user by email
        const [user] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (user.length === 0) return res.status(404).json({ message: "User not found" });

        const userId = user[0].id;

        // Update Balance
        await db.query('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [amount, userId]);

        // Log Transaction
        await db.query('INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, ?)', 
            [userId, amount, 'topup']
        );

        res.status(200).json({ success: true, message: `Recharged ₹${amount} for ${email}` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Top-up failed" });
    }
};