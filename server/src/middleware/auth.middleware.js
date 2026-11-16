// server/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const UserIndia = require('../models/UserIndia.model');
const Company = require('../models/Company.model');

const JWT_SECRET = process.env.JWT_SECRET || 'rd_tax_incentive_india_jwt_super_secret_key_2026';

/**
 * Protect routes: requires valid JWT bearer token
 */
exports.protect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this resource. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserIndia.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact support.'
      });
    }

    // Attach user
    req.user = user;

    // Attach company if linked
    let company = null;
    if (user.companyId) {
      company = await Company.findById(user.companyId);
    }
    if (!company) {
      company = await Company.findOne({ userId: user._id });
    }
    if (company && !user.companyId) {
      user.companyId = company._id;
      await user.save();
    }
    req.company = company;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please log in again.'
    });
  }
};

/**
 * Optional protection: attaches user & company if token is present, but doesn't block if missing
 */
exports.optionalProtect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserIndia.findById(decoded.id).select('-passwordHash');
    if (user) {
      req.user = user;
      let company = null;
      if (user.companyId) {
        company = await Company.findById(user.companyId);
      }
      if (!company) {
        company = await Company.findOne({ userId: user._id });
      }
      req.company = company;
    }
  } catch (err) {
    // Ignore invalid token for optional routes
  }
  next();
};
