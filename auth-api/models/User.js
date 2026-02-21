const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password required'],
    minlength: 6
  }
}, {
  timestamps: true
});

// SIMPLIFIED PASSWORD HASHING (No next() issue)
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
