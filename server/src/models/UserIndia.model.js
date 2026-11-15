// server/src/models/UserIndia.model.js
const mongoose = require('mongoose');

const UserIndiaSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ['STARTUP_FOUNDER_DIRECTOR', 'FINANCE_HEAD', 'TECH_LEAD', 'TAX_CONSULTANT', 'PARTNER_CHARTERED_ACCOUNTANT'],
            default: 'STARTUP_FOUNDER_DIRECTOR'
        },
        engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'EngagementIndia', default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model('UserIndia', UserIndiaSchema);