const express     = require('express');
const jwt         = require('jsonwebtoken');
const Application = require('../models/Application');

const router = express.Router();

// Extract the student ID from the Authorization header if present.
// Does NOT block the request if the token is missing or invalid —
// the public apply flow still works without a logged-in student.
function getStudentIdFromToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer')) return null;
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role === 'student' ? decoded.id : null;
  } catch {
    return null;
  }
}

router.post('/', async (req, res) => {
  const { firstName, lastName, email, phone, matricNo, department, level, gender, roomType, session, notes } = req.body;
  if (!firstName || !email || !matricNo || !roomType || !session) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  try {
    const existing = await Application.findOne({ matricNo, session });
    if (existing) return res.status(400).json({ message: 'You have already applied for this session' });

    const studentId = getStudentIdFromToken(req);

    const application = await Application.create({
      firstName, lastName, email, phone, matricNo, department, level, gender, roomType, session, notes,
      studentId,
    });
    res.status(201).json({
      message: 'Application submitted! We will contact you within 1-2 business days.',
      applicationId: application._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const { matricNo } = req.query;
    if (!matricNo) {
      return res.status(400).json({ message: 'matricNo query parameter is required' });
    }
    const applications = await Application.find({ matricNo }).sort({ createdAt: -1 });
    if (!applications.length) return res.status(404).json({ message: 'No applications found' });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
