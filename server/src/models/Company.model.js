const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    legalName: {
      type: String,
      required: [true, 'Company legal name is required'],
      trim: true,
      maxlength: 150
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          return !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
        },
        message: 'Invalid Indian PAN format. Must be 10 characters (e.g. ABCDE1234F)'
      }
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true
    },
    incorporationDate: {
      type: Date,
      required: [true, 'Incorporation date is required']
    },
    dpiitDetails: {
      isRecognized: { type: Boolean, default: false },
      certificateNumber: { type: String, trim: true, default: null }
    },
    hasRegisteredIndianPatents: {
      type: Boolean,
      default: false
    },
    hasDsirApprovedLab: {
      type: Boolean,
      default: false
    },
    industrySector: {
      type: String,
      required: true,
      enum: [
        'Software/SaaS & AI',
        'Deeptech & Hardware',
        'Biotechnology & Pharma',
        'CleanTech & EV',
        'Fintech',
        'Engineering & Manufacturing Services',
        'Other'
      ]
    },
    headcount: {
      type: Number,
      required: true,
      min: 1
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserIndia',
      index: true
    },
    authorizedRepresentatives: [{
      name: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
      phone: { type: String, trim: true },
      designation: { type: String, trim: true }
    }],
    charteredAccountant: {
      caName: { type: String, trim: true },
      membershipNumber: { type: String, trim: true },
      firmName: { type: String, trim: true },
      caEmail: { type: String, lowercase: true, trim: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);

