// server/src/models/SupportTicket.model.js
const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserIndia',
      required: true,
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['ELIGIBILITY', 'ENGAGEMENT', 'DOCUMENT_UPLOAD', 'TAX_INCENTIVE_QUERY', 'TECHNICAL_SUPPORT', 'OTHER'],
      default: 'TAX_INCENTIVE_QUERY'
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true
    },
    responses: [
      {
        sender: { type: String, default: 'Support Team' },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
