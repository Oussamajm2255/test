const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger'); // Assuming you have a logger setup

const router = express.Router();

// Register route with validation and improved error handling
router.post(
  '/',
  [
    body('shiftName').trim().notEmpty().withMessage('Shift name is required'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    const { shiftName, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if shiftName already exists
      const [existingShifts] = await db.query('SELECT * FROM shifts WHERE shift_name = ?', [shiftName]);

      if (existingShifts.length > 0) {
        return res.status(400).json({ message: 'Shift name already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new shift
      await db.query('INSERT INTO shifts (shift_name, password) VALUES (?, ?)', [shiftName, hashedPassword]);

      logger.info('Shift registered successfully', { shiftName });
      res.status(201).json({ message: 'Shift registered successfully' });
    } catch (error) {
      logger.error('Error registering shift', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;


