const express     = require('express');
const Maintenance = require('../models/Maintenance');
const Student     = require('../models/Student');
const { protectStudent } = require('../middleware/auth');

const router = express.Router();

// Submit a new maintenance request
router.post('/', protectStudent, async (req, res) => {
  try {
    const { issueType, description, priority } = req.body;
    if (!issueType || !description) {
      return res.status(400).json({ message: 'Please select an issue type and describe the problem' });
    }

    const student = await Student.findById(req.student._id);
    const room = student.roomAssigned || {};

    const request = await Maintenance.create({
      student: req.student._id,
      issueType,
      description,
      priority: priority || 'Normal',
      roomNumber: room.roomNumber || null,
      block: room.block || null,
    });

    res.status(201).json({ message: 'Request submitted! We will attend to it within 24–48 hours.', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting request' });
  }
});

// Get the logged-in student's own requests
router.get('/my-requests', protectStudent, async (req, res) => {
  try {
    const requests = await Maintenance.find({ student: req.student._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;