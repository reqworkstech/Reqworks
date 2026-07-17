const mongoose = require('mongoose');

const PreviewSubmissionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['full_form', 'callback_request'],
    default: 'full_form',
    required: true
  },

  // Common fields
  name: { type: String, required: true },
  email: {
    type: String,
    required: function () { return this.type === 'full_form'; }
  },
  phone: {
    type: String,
    required: function () { return this.type === 'callback_request'; }
  },

  // Full form only
  website: { type: String },
  businessDescription: {
    type: String,
    required: function () { return this.type === 'full_form'; }
  },
  selectedSections: {
    type: [String],
    validate: [arr => arr.length <= 3, 'Maximum 3 sections allowed']
  },
  styleColors: { type: String },
  referenceWebsite: { type: String },

  // Callback request only
  preferredTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', null],
    default: null
  },

  // Admin tracking
  status: {
    type: String,
    enum: ['new', 'contacted', 'delivered', 'converted'],
    default: 'new'
  },

  // Anti-spam (honeypot field, should always be empty)
  honeypot: { type: String, select: false },

  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PreviewSubmission', PreviewSubmissionSchema);
