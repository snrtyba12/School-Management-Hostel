const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  roomNumber: { type: String, default: null },
  block: { type: String, default: null },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);