const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('../config/database');
const logger = require('../utils/logger');
const authenticateToken = require('../middleware/authenticateToken');
const loginLimiter = require('../middleware/rateLimiter'); 
const router = express.Router();

router.post(
  '/',
  loginLimiter,
  [
    body('shiftName').trim().notEmpty().withMessage('Shift name is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
    body('machineId').trim().notEmpty().withMessage('Machine ID is required')
  ],
  async (req, res) => {
    const { shiftName, password, machineId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      logger.info('Login attempt', { shiftName, machineId });

      const [rows] = await db.query('SELECT * FROM shifts WHERE shift_name = ?', [shiftName]);
      const shift = rows[0];

      if (!shift) {
        logger.warn('Shift not found', { shiftName });
        return res.status(401).json({ message: "Invalid shift name or password" });
      }

      const passwordMatch = await bcrypt.compare(password, shift.password);

      if (!passwordMatch) {
        logger.warn('Password mismatch', { shiftName });
        return res.status(401).json({ message: "Invalid shift name or password" });
      }

      const token = jwt.sign(
        { shiftId: shift.id, shiftName: shift.shift_name },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
      );

      logger.info('Login successful', { shiftName });
      res.json({ token, shiftId: shift.id, machineId });
    } catch (error) {
      logger.error('Error during login', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Serve static files securely
router.use('/public', express.static(path.join(__dirname, '..', '..', 'frontend', 'public')));

// GET /login
router.get('/login', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname, '..', '..', 'frontend', 'public') });
});

// GET /Home
router.get('/Home', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '..', '..', 'frontend', 'public') });
});


module.exports = router;
