// controllers/stoppageLogController.js
const db = require('../config/database');
const logger = require('../config/logger'); // Ensure you have a logger for consistent logging
const { body, validationResult } = require('express-validator'); // For validation

// Get all stoppage logs
const getAllStoppageLogs = async (req, res) => {
  try {
    // Fetch all stoppage logs from the database
    const [rows] = await db.query('SELECT * FROM stoppage_logs');
    res.status(200).json(rows); // Send the stoppage logs as JSON response
  } catch (error) {
    logger.error('Error fetching stoppage logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new stoppage log entry
const createStoppageLog = async (req, res) => {
  // Validation rules
  const validations = [
    body('timeOfStop').isISO8601().withMessage('Invalid time format'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
    body('stopReason').trim().notEmpty().withMessage('Stop reason is required'),
    body('customReasonText').optional().trim(),
    body('trsPercentage').isNumeric().withMessage('TRS percentage must be a number'),
    body('nonTrsPercentage').isNumeric().withMessage('Non-TRS percentage must be a number'),
    body('machineId').isInt({ min: 1 }).withMessage('Invalid machine ID'),
    body('shiftId').isInt({ min: 1 }).withMessage('Invalid shift ID')
  ];

  // Run validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { timeOfStop, duration, stopReason, customReasonText, trsPercentage, nonTrsPercentage, machineId, shiftId } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO stoppage_logs (timeOfStop, duration, stopReason, customReasonText, trsPercentage, nonTrsPercentage, machineId, shiftId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [timeOfStop, duration, stopReason, customReasonText, trsPercentage, nonTrsPercentage, machineId, shiftId]
    );

    if (result.affectedRows === 1) {
      return res.status(201).json({ message: 'Stoppage log created successfully', id: result.insertId });
    } else {
      return res.status(500).json({ message: 'Failed to create stoppage log' });
    }
  } catch (error) {
    logger.error('Error creating stoppage log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAllStoppageLogs, createStoppageLog };

