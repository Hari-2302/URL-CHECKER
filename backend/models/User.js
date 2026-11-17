const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true // Fast lookup index
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Threat Intelligence Analyst'
  },
  avatar: {
    type: String,
    default: 'SA'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
