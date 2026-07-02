const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  recipient: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['whatsapp', 'email', 'telegram'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    enum: ['to_user', 'to_admin'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

NotificationSchema.index({ userId: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
