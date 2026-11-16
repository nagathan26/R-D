const express = require('express');
const router = express.Router();

const eligibilityController = require('../controllers/eligibilityIndia.controller');
const engagementController = require('../controllers/engagementIndia.controller');
const ingestionController = require('../controllers/ingestionIndia.controller');
const { optionalProtect } = require('../middleware/auth.middleware');

// Module 1: Screener & Company Context
router.post('/eligibility/screen', optionalProtect, eligibilityController.screenIndiaEligibility);
router.get('/company/:id', eligibilityController.getCompanyContext);

// Module 2: Engagement, Nodemailer OTP & Execution
router.post('/engagements/prepare', engagementController.prepareOrGetEngagement);
router.post('/engagements/:id/send-otp', engagementController.sendSigningOtp);
router.post('/engagements/:id/verify-and-sign', engagementController.verifyAndSignAgreement);
router.post('/engagements/:id/sign', engagementController.signIndiaAgreement); // Backward compatibility

// Module 3: Compliance Data Ingestion & Extraction
router.get('/ingestion/checklist/:engagementId', ingestionController.getIncentiveChecklist);
router.post('/ingestion/upload', ingestionController.validateAndUploadIndiaDoc);
router.put('/ingestion/records/:id/review', ingestionController.reviewExtractedDocument);
router.get('/ingestion/records/:engagementId', ingestionController.getRecordsByEngagement);

module.exports = router;

