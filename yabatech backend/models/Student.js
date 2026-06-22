const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  // Personal info (from register form)
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  username:   { type: String, required: true, unique: true, lowercase: true, trim: true },
  matricNo:   { type: String, required: true, unique: true, trim: true },
  level:      { type: String, required: true },
  gender:     { type: String, required: true, enum: ['Male', 'Female'] },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:      { type: String, trim: true },
  password:   { type: String, required: true },

  // Room assignment (set by admin)
  roomAssigned: {
    roomNumber: { type: String, default: null },
    block:      { type: String, default: null },
    roomType:   { type: String, default: null },
    floor:      { type: String, default: null },
  },

  // Account status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },

}, { timestamps: true });

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
