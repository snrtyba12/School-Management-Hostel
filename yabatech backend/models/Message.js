const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, trim: true },
  email:     { type: String, required: true, lowercase: true, trim: true },
  phone:     { type: String, trim: true },
  subject:   { type: String, required: true },
  message:   { type: String, required: true },
  // Admin tracking
  read:      { type: Boolean, default: false },
  replied:   { type: Boolean, default: false },
  replyText: { type: String, default: null },
  repliedAt: { type: Date, default: null },
}, { timestamps: true });
module.exports = mongoose.model('Message', messageSchema);