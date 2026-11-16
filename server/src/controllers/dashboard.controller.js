// server/src/controllers/dashboard.controller.js
const mongoose = require('mongoose');
const Company = require('../models/Company.model');
const EligibilityAssessment = require('../models/EligibilityAssessment.model');
const EngagementIndia = require('../models/EngagementIndia.model');
const IngestionRecordIndia = require('../models/IngestionRecordIndia.model');
const Notification = require('../models/Notification.model');
const SupportTicket = require('../models/SupportTicket.model');

/**
 * Get comprehensive SaaS dashboard summary
 */
exports.getSummary = async (req, res, next) => {
  try {
    const user = req.user;
    const company = req.company;

    if (!company) {
      return res.status(200).json({
        success: true,
        data: {
          user,
          company: null,
          currentStep: 1,
          journeyProgress: 10,
          stats: {
            profileComplete: false,
            assessmentStatus: 'NOT_STARTED',
            eligibleIncentivesCount: 0,
            agreementStatus: 'NOT_INITIATED',
            pendingDocumentsCount: 0,
            verifiedDocumentsCount: 0,
            estimatedSavingsFormatted: '₹0'
          },
          latestAssessment: null,
          latestEngagement: null,
          recentDocuments: [],
          recentNotifications: []
        }
      });
    }

    // 1. Fetch latest assessment
    const latestAssessment = await EligibilityAssessment.findOne({ companyId: company._id }).sort({ createdAt: -1 });

    // 2. Fetch latest engagement
    const latestEngagement = await EngagementIndia.findOne({ companyId: company._id }).sort({ createdAt: -1 });

    // 3. Fetch documents
    const documents = await IngestionRecordIndia.find({ companyId: company._id }).sort({ createdAt: -1 });
    const pendingDocumentsCount = documents.filter(d => !d.humanReviewed).length;
    const verifiedDocumentsCount = documents.filter(d => d.humanReviewed).length;

    // 4. Fetch notifications
    const recentNotifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);

    // 5. Calculate customer journey stage
    let currentStep = 1;
    let journeyProgress = 25;

    if (latestAssessment) {
      currentStep = 2;
      journeyProgress = 50;
    }
    if (latestEngagement && latestEngagement.agreementStatus === 'EXECUTED') {
      currentStep = 3;
      journeyProgress = 75;
    }
    if (verifiedDocumentsCount > 0) {
      currentStep = 4;
      journeyProgress = 100;
    }

    // 6. Build KPI statistics
    const stats = {
      profileComplete: Boolean(company.legalName && company.pan && company.incorporationDate),
      assessmentStatus: latestAssessment ? 'COMPLETED' : 'PENDING',
      eligibleIncentivesCount: latestAssessment?.targetIncentives?.length || 0,
      targetIncentives: latestAssessment?.targetIncentives || [],
      agreementStatus: latestEngagement ? latestEngagement.agreementStatus : 'NOT_INITIATED',
      pendingDocumentsCount,
      verifiedDocumentsCount,
      totalDocumentsCount: documents.length,
      estimatedSavingsFormatted: latestAssessment?.estimatedTaxSavingsInr?.formatted || '₹0'
    };

    return res.status(200).json({
      success: true,
      data: {
        user,
        company,
        currentStep,
        journeyProgress,
        stats,
        latestAssessment,
        latestEngagement,
        recentDocuments: documents.slice(0, 5),
        recentNotifications
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get company profile
 */
exports.getCompanyProfile = async (req, res, next) => {
  try {
    const company = req.company;
    if (!company) {
      return res.status(404).json({ success: false, error: 'No company profile found for this account.' });
    }
    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

/**
 * Update company profile
 */
exports.updateCompanyProfile = async (req, res, next) => {
  try {
    let company = req.company;
    const {
      legalName,
      gstin,
      headcount,
      industrySector,
      incorporationDate,
      dpiitDetails,
      hasRegisteredIndianPatents,
      hasDsirApprovedLab,
      contactPhone,
      charteredAccountant
    } = req.body;

    if (!company) {
      const generatedCompanyId = 'COMP-' + Date.now().toString(36).toUpperCase();
      company = new Company({
        companyId: generatedCompanyId,
        legalName: legalName || `${req.user.name}'s Enterprise`,
        contactEmail: req.user.email,
        userId: req.user._id,
        incorporationDate: new Date(),
        headcount: 5,
        industrySector: 'Software/SaaS & AI'
      });
    }

    if (legalName) company.legalName = legalName.trim();
    if (gstin) company.gstin = gstin.trim().toUpperCase();
    if (headcount) company.headcount = Number(headcount);
    if (industrySector) company.industrySector = industrySector;
    if (incorporationDate) company.incorporationDate = new Date(incorporationDate);
    if (dpiitDetails) company.dpiitDetails = dpiitDetails;
    if (hasRegisteredIndianPatents !== undefined) company.hasRegisteredIndianPatents = Boolean(hasRegisteredIndianPatents);
    if (hasDsirApprovedLab !== undefined) company.hasDsirApprovedLab = Boolean(hasDsirApprovedLab);
    if (contactPhone) company.contactPhone = contactPhone.trim();
    if (charteredAccountant) company.charteredAccountant = charteredAccountant;

    await company.save();

    if (!req.user.companyId) {
      req.user.companyId = company._id;
      await req.user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully.',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get assessment history
 */
exports.getAssessments = async (req, res, next) => {
  try {
    const company = req.company;
    if (!company) {
      return res.status(200).json({ success: true, data: [] });
    }
    const assessments = await EligibilityAssessment.find({ companyId: company._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get engagement agreements history
 */
exports.getEngagements = async (req, res, next) => {
  try {
    const company = req.company;
    if (!company) {
      return res.status(200).json({ success: true, data: [] });
    }
    const engagements = await EngagementIndia.find({ companyId: company._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: engagements });
  } catch (error) {
    next(error);
  }
};

/**
 * Get uploaded documents
 */
exports.getDocuments = async (req, res, next) => {
  try {
    const company = req.company;
    if (!company) {
      return res.status(200).json({ success: true, data: [] });
    }
    const documents = await IngestionRecordIndia.find({ companyId: company._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    } else {
      await Notification.findByIdAndUpdate(id, { $set: { read: true } });
    }
    return res.status(200).json({ success: true, message: 'Notification(s) updated.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get support tickets
 */
exports.getSupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new support ticket
 */
exports.createSupportTicket = async (req, res, next) => {
  try {
    const { subject, category, description, priority } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ success: false, error: 'Subject and description are required.' });
    }

    const ticketId = 'TCK-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    const ticket = await SupportTicket.create({
      ticketId,
      userId: req.user._id,
      companyId: req.company?._id || null,
      subject: subject.trim(),
      category: category || 'TAX_INCENTIVE_QUERY',
      description: description.trim(),
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      responses: [
        {
          sender: 'Antigravity India Tax Team',
          message: `Your support ticket #${ticketId} has been acknowledged. A compliance specialist will review your request within 24 business hours.`
        }
      ]
    });

    // Create a notification
    await Notification.create({
      userId: req.user._id,
      title: `Support Ticket Created: #${ticketId}`,
      message: `Your inquiry "${subject}" has been received.`,
      type: 'SUPPORT',
      link: '/dashboard/support'
    });

    return res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};
