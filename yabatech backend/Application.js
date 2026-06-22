const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Student personal info (submitted from apply.html)
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  phone:       { type: String, trim: true },
  matricNo:    { type: String, required: true, trim: true },
  department:  { type: String, trim: true },
  level:       { type: String },
  gender:      { type: String, enum: ['Male', 'Female'] },

  // Room preferences
  roomType:    {
    type: String,
    required: true,
    enum: ['single', 'double', 'triple', 'quad'],
  },
  session:     { type: String, required: true },
  notes:       { type: String, default: '' },

  // Admin action
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending',
  },

  // Link to student account if they have one
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null,
  },

}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
