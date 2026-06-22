const jwt     = require('jsonwebtoken');
const Student = require('../models/Student');

const protectStudent = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.student = await Student.findById(decoded.id).select('-password');
      if (!req.student) return res.status(401).json({ message: 'Student not found' });
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorised, token failed' });
    }
  }
  if (!token) return res.status(401).json({ message: 'Not authorised, no token' });
};

const protectAdmin = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
      req.admin = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorised, token failed' });
    }
  }
  if (!token) return res.status(401).json({ message: 'Not authorised, no token' });
};

module.exports = { protectStudent, protectAdmin };