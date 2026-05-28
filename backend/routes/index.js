const { verifyToken, isAdmin } = require('../middleware/auth');

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const walletController = require('../controllers/walletController');
const adminController = require('../controllers/adminController');
const messController = require('../controllers/messController'); // Import the new controller

console.log("Wallet Controller Methods:", Object.keys(walletController));
console.log("Mess Controller Methods:", Object.keys(messController));

// --- AUTH ROUTES ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// --- STUDENT ROUTES ---
router.get('/wallet/balance', verifyToken, walletController.getBalance);
router.post('/wallet/pay', verifyToken, walletController.processPayment);
router.get('/wallet/history', verifyToken, walletController.getMyHistory); 
router.get('/wallet/scan-preview', verifyToken, walletController.scanPreview);

// --- MESS FEATURES (Students) ---
router.get('/mess/menu', verifyToken, messController.getMenu); 
router.post('/mess/feedback', verifyToken, messController.submitFeedback); 
router.get('/mess/menu/full', verifyToken, messController.getFullMenu);

// --- ADMIN ROUTES ---
router.get('/admin/transactions', verifyToken, isAdmin, adminController.getAllTransactions);
router.post('/admin/topup', verifyToken, isAdmin, adminController.topupWallet);
router.get('/admin/feedback', verifyToken, isAdmin, messController.getAllFeedback); 
router.get('/wallet/qr', verifyToken, walletController.generateQR)
router.post('/wallet/verify-scan', verifyToken, isAdmin, walletController.verifyScan);
router.post('/wallet/recharge', verifyToken, walletController.selfRecharge);
module.exports = router;