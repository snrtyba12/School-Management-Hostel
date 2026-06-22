const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

router.post('/', async (req, res) => {
  const { firstName, lastName, email, phone, subject, message } = req.body;
  if (!firstName || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  try {
    await Message.create({ firstName, lastName, email, phone, subject, message });
    res.status(201).json({ message: 'Message received! Our team will reply within 1-2 business days.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

module.exports = router;