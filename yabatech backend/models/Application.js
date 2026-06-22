const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  firstName:  { type: String, required: true },
  lastName:   { type: String, required: true },
  email:      { type: String, required: true },
  phone:      { type: String },
  matricNo:   { type: String, required: true },
  department: { type: String },
  level:      { type: String },
  gender:     { type: String },
  roomType:   { type: String, required: true },
  session:    { type: String, required: true },
  notes:      { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);