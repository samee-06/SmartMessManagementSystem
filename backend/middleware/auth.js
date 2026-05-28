const jwt = require('jsonwebtoken'); 

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Access Denied. No token provided." });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: "Invalid Token" });
    }
};

// 2. Admin Security Guard (Verifies if the logged-in user is an Admin)
const isAdmin = (req, res, next) => {
    console.log("User data from Token:", req.user); // Debug line
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Admin access required" });
    }
};

// Export both functions
module.exports = { verifyToken, isAdmin };