const express     = require('express');
const Application = require('../models/Application');

const router = express.Router();

router.post('/', async (req, res) => {
  const { firstName, lastName, email, phone, matricNo, department, level, gender, roomType, session, notes } = req.body;
  if (!firstName || !email || !matricNo || !roomType || !session) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  try {
    const existing = await Application.findOne({ matricNo, session });
    if (existing) return res.status(400).json({ message: 'You have already applied for this session' });
    const application = await Application.create({
      firstName, lastName, email, phone, matricNo, department, level, gender, roomType, session, notes,
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