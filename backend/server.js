const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const apiRoutes = require('./routes/index');
const app = express();

// --- Middleware Pipeline ---
app.use(helmet()); // Security headers
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON payloads
app.use(morgan('dev')); // Log HTTP requests
app.use('/api', apiRoutes);

// --- Basic Health Check Route ---
app.get('/api/status', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "UniWallet Server is Running and Secure!" 
    });
});

// --- Server Initialization ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Running on http://0.0.0.0:${PORT}`);
});