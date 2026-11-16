// server/src/models/Notification.model.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserIndia',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['ASSESSMENT', 'ENGAGEMENT', 'DOCUMENT', 'APPLICATION', 'SYSTEM', 'SUPPORT'],
      default: 'SYSTEM'
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
