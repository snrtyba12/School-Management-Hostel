const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────
app.use(cors());                        // Allow requests from your HTML pages
app.use(express.json());               // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────
app.use('/api/student',  require('./routes/auth'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/apply',    require('./routes/applications'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/maintenance', require('./routes/maintenance'));

// ── Health check ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '✅ Yabatech Hostel API is running',
    version: '1.0.0',
    endpoints: {
      studentRegister:  'POST /api/student/register',
      studentLogin:     'POST /api/student/login',
      studentProfile:   'GET  /api/student/me',
      adminLogin:       'POST /api/admin/login',
      adminStats:       'GET  /api/admin/stats',
      adminApplications:'GET  /api/admin/applications',
      adminResidents:   'GET  /api/admin/residents',
      adminMessages:    'GET  /api/admin/messages',
      adminAnnouncements:'GET /api/admin/announcements',
      submitApplication:'POST /api/apply',
      checkStatus:      'GET  /api/apply/status/:matricNo',
      contactForm:      'POST /api/contact',
    }
  });
});

// ── 404 handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Start server ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
