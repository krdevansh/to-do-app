const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: ""
  },
  age: {
    type: Number,
    default: null
  },
  weight: {
    type: Number, // in kg
    default: null
  },
  height: {
    type: Number, // in cm
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
