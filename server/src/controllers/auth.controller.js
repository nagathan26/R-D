// server/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const UserIndia = require('../models/UserIndia.model');
const Company = require('../models/Company.model');
const EligibilityAssessment = require('../models/EligibilityAssessment.model');
const EngagementIndia = require('../models/EngagementIndia.model');
const Notification = require('../models/Notification.model');

const JWT_SECRET = process.env.JWT_SECRET || 'rd_tax_incentive_india_jwt_super_secret_key_2026';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Register a new customer and create their initial company profile
 */
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      companyLegalName,
      companyPan,
      gstin,
      designation
    } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email address, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }

    // 2. Check if user already exists
    const existingUser = await UserIndia.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address is already registered. Please log in instead.'
      });
    }

    // Clean PAN if provided
    const cleanedPan = companyPan && companyPan.trim() !== '' ? companyPan.trim().toUpperCase() : undefined;
    if (cleanedPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanedPan)) {
      return res.status(400).json({
        success: false,
        error: `Invalid Indian PAN format '${companyPan}'. Must be 10 characters (e.g. ABCDE1234F).`
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create User
    const user = await UserIndia.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      designation: designation ? designation.trim() : 'Director / Founder',
      role: 'STARTUP_FOUNDER_DIRECTOR',
      emailVerified: true,
      accountStatus: 'ACTIVE'
    });

    // 5. Create or Link Company
    let company = null;
    const finalCompanyName = companyLegalName && companyLegalName.trim() ? companyLegalName.trim() : `${name.trim()}'s Enterprise`;

    if (cleanedPan) {
      company = await Company.findOne({ pan: cleanedPan });
    }

    if (!company) {
      const generatedCompanyId = 'COMP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
      company = await Company.create({
        companyId: generatedCompanyId,
        legalName: finalCompanyName,
        pan: cleanedPan,
        gstin: gstin ? gstin.trim().toUpperCase() : undefined,
        incorporationDate: new Date(),
        industrySector: 'Software/SaaS & AI',
        headcount: 5,
        contactEmail: email.toLowerCase().trim(),
        contactPhone: phone ? phone.trim() : undefined,
        userId: user._id,
        authorizedRepresentatives: [{
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone ? phone.trim() : undefined,
          designation: designation ? designation.trim() : 'Director / Founder'
        }]
      });
    } else {
      company.userId = user._id;
      if (!company.authorizedRepresentatives || company.authorizedRepresentatives.length === 0) {
        company.authorizedRepresentatives = [{
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone ? phone.trim() : undefined,
          designation: designation ? designation.trim() : 'Director'
        }];
      }
      await company.save();
    }

    // Update user with companyId
    user.companyId = company._id;
    await user.save();

    // 6. Create Welcome Notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to TaxIncentive.in!',
      message: `Your account for ${company.legalName} has been created. Start by evaluating your eligibility in Module 1.`,
      type: 'SYSTEM',
      link: '/dashboard/screener'
    });

    // 7. Return Token and User Profile
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the India R&D Tax Incentive Platform.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        role: user.role,
        companyId: company._id
      },
      company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in existing customer
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both email and password.'
      });
    }

    const user = await UserIndia.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. No account found with this email.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Incorrect password.'
      });
    }

    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact support.'
      });
    }

    // Retrieve linked company
    let company = null;
    if (user.companyId) {
      company = await Company.findById(user.companyId);
    }
    if (!company) {
      company = await Company.findOne({ userId: user._id });
      if (company && !user.companyId) {
        user.companyId = company._id;
        await user.save();
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        role: user.role,
        companyId: company ? company._id : null
      },
      company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile and live workflow context
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let company = req.company;

    if (!company && user.companyId) {
      company = await Company.findById(user.companyId);
    }
    if (!company) {
      company = await Company.findOne({ userId: user._id });
    }

    // Retrieve latest assessment
    let latestAssessment = null;
    if (company) {
      latestAssessment = await EligibilityAssessment.findOne({ companyId: company._id }).sort({ createdAt: -1 });
    }

    // Retrieve latest engagement
    let latestEngagement = null;
    if (company) {
      latestEngagement = await EngagementIndia.findOne({ companyId: company._id }).sort({ createdAt: -1 });
    }

    // Unread notifications count
    const unreadNotificationsCount = await Notification.countDocuments({ userId: user._id, read: false });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        role: user.role,
        companyId: company ? company._id : null
      },
      company,
      latestAssessment,
      latestEngagement,
      unreadNotificationsCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer Logout
 */
exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * Forgot password handler
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await UserIndia.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't leak user existence
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been dispatched.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    console.log(`[AUTH] Password reset token for ${user.email}: ${resetToken}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset instructions have been dispatched to your email address.',
      demoToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserIndia.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};
