const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/authenticateToken');
const logger = require('../config/logger');
const { query, validationResult } = require('express-validator');

// GET /shiftData - Retrieve shift data
router.get('/shiftData', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM shifts WHERE id = ?', [req.shift.shiftId]);
    const shift = rows[0];
    if (shift) {
      res.json({ shiftId: shift.id, shiftName: shift.shift_name });
    } else {
      res.sendStatus(404); // Not Found
    }
  } catch (error) {
    logger.error('Error retrieving shift data:', error);
    res.sendStatus(500); // Internal Server Error
  }
});

// GET /stoppageLogs - Retrieve stoppage logs with validation
router.get('/stoppageLogs',
  authenticateToken,
  [
    query('shiftId').trim().notEmpty().withMessage('Shift ID is required').isNumeric().withMessage('Shift ID must be numeric'),
    query('machineId').trim().notEmpty().withMessage('Machine ID is required').isNumeric().withMessage('Machine ID must be numeric')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shiftId, machineId } = req.query;
    try {
      const stoppageLogs = await getStoppageLogsFromDatabase(shiftId, machineId);
      res.json(stoppageLogs);
    } catch (error) {
      logger.error('Error fetching stoppage logs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

async function getStoppageLogsFromDatabase(shiftId, machineId) {
  const query = 'SELECT * FROM stoppage_logs WHERE shiftId = ? AND machineId = ?';
  const [results] = await db.execute(query, [shiftId, machineId]);
  return results;
}

module.exports = router;

