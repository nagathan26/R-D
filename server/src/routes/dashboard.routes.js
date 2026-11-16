// server/src/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

// All dashboard routes are protected
router.use(protect);

router.get('/summary', dashboardController.getSummary);
router.get('/company', dashboardController.getCompanyProfile);
router.put('/company', dashboardController.updateCompanyProfile);
router.get('/assessments', dashboardController.getAssessments);
router.get('/engagements', dashboardController.getEngagements);
router.get('/documents', dashboardController.getDocuments);
router.get('/notifications', dashboardController.getNotifications);
router.put('/notifications/:id/read', dashboardController.markNotificationRead);
router.get('/support', dashboardController.getSupportTickets);
router.post('/support', dashboardController.createSupportTicket);

module.exports = router;
