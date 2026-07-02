const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // not returned in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  emailVerificationOTP: String,
  emailVerificationOTPExpiry: Date,
  passwordResetToken: String,
  passwordResetExpiry: Date,
  phone: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: ''
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  projectsSubmitted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, { timestamps: true });


// Auto-generate unique Customer ID if not present before validation
UserSchema.pre('validate', async function (next) {
  if (!this.customerId) {
    try {
      let isUnique = false;
      let customerId = '';
      while (!isUnique) {
        const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
        customerId = `CID-${randomNum}`;
        const existing = await this.constructor.findOne({ customerId });
        if (!existing) {
          isUnique = true;
        }
      }
      this.customerId = customerId;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
