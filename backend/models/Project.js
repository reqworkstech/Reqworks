const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stack: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    default: ''
  },
  needsAi: {
    type: Boolean,
    default: false
  },
  callbackRequested: {
    type: Boolean,
    default: false
  },
  callbackPhone: {
    type: String,
    default: ''
  },
  files: [{
    filename: String,
    originalname: String,
    path: String,
    size: Number,
    mimetype: String
  }],
  stage: {
    type: String,
    required: true,
    enum: ['Submitted', 'Estimated', 'Review', 'Planning', 'Building', 'Testing', 'Final Checks', 'Completed', 'Rejected'],
    default: 'Submitted'
  },
  estimatedPrice: {
    type: Number,
    default: 0
  },
  whatsLeftNotes: {
    type: String,
    default: ''
  },
  priceEstimated: {
    type: Boolean,
    default: false
  },
  userDecision: {
    type: String,
    enum: ['None', 'Booked', 'Bargained', 'Deleted'],
    default: 'None'
  },
  bargainPrice: {
    type: Number,
    default: 0
  },
  bargainMessage: {
    type: String,
    default: ''
  },
  depositPaid: {
    type: Boolean,
    default: false
  },
  finalPaid: {
    type: Boolean,
    default: false
  },
  razorpayOrderId: {
    type: String,
    default: ''
  },
  razorpayPaymentId: {
    type: String,
    default: ''
  },
  changeRequests: [{
    sender: {
      type: String,
      enum: ['client', 'admin']
    },
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  color: {
    type: String,
    default: 'var(--primary)'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

ProjectSchema.index({ stage: 1 });
ProjectSchema.index({ userId: 1, stage: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
