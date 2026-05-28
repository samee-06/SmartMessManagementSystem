// middleware/adminAuth.js
const verifyAdmin = (req, res, next) => {
    // req.user was attached by the previous auth.js middleware
    if (req.user && req.user.role === 'admin') {
        next(); // Let them pass to the admin dashboard
    } else {
        res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }
};

module.exports = verifyAdmin;