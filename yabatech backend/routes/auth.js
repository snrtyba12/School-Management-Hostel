const express        = require('express');
const jwt            = require('jsonwebtoken');
const Student        = require('../models/Student');
const { protectStudent } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id, role: 'student' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

router.post('/register', async (req, res) => {
  const {
    firstName, lastName, username, matricNo,
    level, gender, email, phone, password,
  } = req.body;
  try {
    const emailExists    = await Student.findOne({ email });
    const usernameExists = await Student.findOne({ username });
    const matricExists   = await Student.findOne({ matricNo });
    if (emailExists)    return res.status(400).json({ message: 'Email already registered' });
    if (usernameExists) return res.status(400).json({ message: 'Username already taken' });
    if (matricExists)   return res.status(400).json({ message: 'Matric number already registered' });
    const student = await Student.create({
      firstName, lastName, username, matricNo,
      level, gender, email, phone, password,
    });
    res.status(201).json({
      message: 'Account created successfully',
      token:   generateToken(student._id),
      student: {
        id: student._id, firstName: student.firstName,
        lastName: student.lastName, username: student.username,
        matricNo: student.matricNo, level: student.level,
        gender: student.gender, email: student.email, phone: student.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const student = await Student.findOne({
      $or: [
        { email:    identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
        { matricNo: identifier },
      ],
    });
    if (!student) return res.status(401).json({ message: 'Invalid credentials' });
    if (student.status === 'suspended') return res.status(403).json({ message: 'Account suspended. Contact hostel office.' });
    const isMatch = await student.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({
      message: 'Login successful',
      token:   generateToken(student._id),
      student: {
        id: student._id, firstName: student.firstName,
        lastName: student.lastName, username: student.username,
        matricNo: student.matricNo, level: student.level,
        gender: student.gender, email: student.email,
        phone: student.phone, roomAssigned: student.roomAssigned,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/me', protectStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.student._id).select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/me', protectStudent, async (req, res) => {
  try {
    const { email, phone } = req.body;
    const student = await Student.findById(req.student._id);
    if (email) student.email = email;
    if (phone) student.phone = phone;
    await student.save();
    res.json({ message: 'Profile updated', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/change-password', protectStudent, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const student = await Student.findById(req.student._id);
    const isMatch = await student.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    student.password = newPassword;
    await student.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;