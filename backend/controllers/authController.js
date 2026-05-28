const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- 1. REGISTER A NEW STUDENT ---
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Step 1: Check if user already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Step 2: Encrypt the password (Exam-worthy security feature)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Step 3: Save to Database
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        // Step 4: Automatically create an empty wallet for the new student
        await db.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0)', [result.insertId]);

        res.status(201).json({ success: true, message: "Student registered successfully!" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// --- 2. LOGIN A STUDENT ---
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // THE FIX: Add 'role: user.role' to the payload below
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                role: user.role  
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(200).json({ success: true, token, role: user.role });
    } catch (error) {
        res.status(500).json({ success: false, message: "Login error" });
    }
};