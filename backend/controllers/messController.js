const db = require('../config/db');

// --- 1. GET MENU ---
exports.getMenu = async (req, res) => {
    try {
        // 1. Force IST Timezone
        const date = new Date();
        const options = { weekday: 'long', timeZone: 'Asia/Kolkata' };
        const todayIST = new Intl.DateTimeFormat('en-US', options).format(date);

        console.log("[DEBUG] Fetching menu for:", todayIST);

        // 2. Use TRIM() to ignore accidental spaces in your database rows
        const [rows] = await db.query('SELECT * FROM menu WHERE TRIM(day) = ?', [todayIST]);

        res.status(200).json({ success: true, day: todayIST, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching menu" });
    }
};

// --- 2. SUBMIT FEEDBACK (Student) ---
exports.submitFeedback = async (req, res) => {
    const { subject, message } = req.body;
    try {
        await db.query(
            'INSERT INTO feedback (user_id, subject, message) VALUES (?, ?, ?)',
            [req.user.id, subject, message]
        );
        res.status(201).json({ success: true, message: "Feedback submitted to Admin!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to submit feedback." });
    }
};

// --- 3. VIEW ALL FEEDBACK (Admin Only) ---
exports.getAllFeedback = async (req, res) => {
    try {
        const [feedbackLogs] = await db.query(`
            SELECT f.id, f.subject, f.message, f.status, f.created_at, u.name 
            FROM feedback f 
            JOIN users u ON f.user_id = u.id 
            ORDER BY f.created_at DESC
        `);
        res.status(200).json({ success: true, data: feedbackLogs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not load feedback logs." });
    }
};

exports.getFullMenu = async (req, res) => {
    try {
        // TRIM() removes hidden spaces from the 'day' column
        const [rows] = await db.query(`
            SELECT TRIM(day) as day, meal_type, items, id 
            FROM mess_menu 
            ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
        `);

        console.log(`[BACKEND] Found ${rows.length} menu items.`);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("[BACKEND ERROR]", error);
        res.status(500).json({ success: false });
    }
};