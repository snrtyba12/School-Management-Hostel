const express      = require('express');
const jwt          = require('jsonwebtoken');
const Student      = require('../models/Student');
const Application  = require('../models/Application');
const Message      = require('../models/Message');
const Announcement = require('../models/Announcement');
const { sendReplyEmail, sendApplicationStatusEmail } = require('../utils/email');
const Maintenance = require('../models/Maintenance');
const { protectAdmin } = require('../middleware/auth');

const router = express.Router();

const generateAdminToken = (username) => {
  return jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    return res.json({
      message: 'Admin login successful',
      token: generateAdminToken(username),
      admin: { username, name: process.env.ADMIN_NAME || username },
    });
  }
  res.status(401).json({ message: 'Invalid admin credentials' });
});
router.get('/applications', protectAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const apps = await Application.find(filter).sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/applications/:id', protectAdmin, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/applications/:id', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!app) return res.status(404).json({ message: 'Application not found' });

    // If approved and this application is linked to a student account,
    // mark the student's room type as pending assignment so it shows on their dashboard.
    if (status === 'approved' && app.studentId) {
      await Student.findByIdAndUpdate(app.studentId, {
        $set: {
          'roomAssigned.roomType': app.roomType,
        },
      });
    }

    if (status === 'approved' || status === 'rejected') {
      sendApplicationStatusEmail({
        to: app.email,
        firstName: app.firstName,
        status,
        roomType: app.roomType,
        session: app.session,
      }).catch(err => console.error('Application status email failed:', err));
    }

    res.json({ message: `Application ${status}`, application: app });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/residents', protectAdmin, async (req, res) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/residents/:id', protectAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/residents/:id/assign-room', protectAdmin, async (req, res) => {
  try {
    const { roomNumber, block, roomType, floor } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id, { roomAssigned: { roomNumber, block, roomType, floor } }, { new: true }
    ).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Room assigned', student });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/residents/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const student = await Student.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: `Student ${status}`, student });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/messages', protectAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/messages/:id/read', protectAdmin, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Marked as read', msg });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/messages/:id/reply', protectAdmin, async (req, res) => {
  try {
    const { replyText } = req.body;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const emailResult = await sendReplyEmail({
      to: msg.email,
      subject: msg.subject,
      replyBody: replyText,
      originalMessage: msg.message,
    });

    if (!emailResult.success) {
      return res.status(502).json({ message: 'Failed to send email. Please try again.' });
    }

    msg.replied = true;
    msg.read = true;
    msg.replyText = replyText;
    msg.repliedAt = new Date();
    await msg.save();

    res.json({ message: 'Reply sent successfully', msg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error sending reply' });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/announcements', protectAdmin, async (req, res) => {
  try {
    const { title, body, priority } = req.body;
    const announcement = await Announcement.create({ title, body, priority, postedBy: req.admin.username });
    res.status(201).json({ message: 'Announcement posted', announcement });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/announcements/:id', protectAdmin, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/maintenance', protectAdmin, async (req, res) => {
  try {
    const requests = await Maintenance.find()
      .populate('student', 'firstName lastName matricNo')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/maintenance/:id', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Maintenance.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('student', 'firstName lastName matricNo');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: `Request marked as ${status}`, request });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/stats', protectAdmin, async (req, res) => {
  try {
    const [totalResidents, pendingApplications, totalMessages, unreadMessages] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      Application.countDocuments({ status: 'pending' }),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
    ]);
    res.json({ totalResidents, pendingApplications, totalMessages, unreadMessages });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;