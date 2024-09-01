// routes/stoppageLogRoutes.js
const express = require('express');
const router = express.Router();
const stoppageLogController = require('../controllers/stoppageLogController');
const authenticateToken = require('../middleware/authenticateToken');
const logger = require('../config/logger');
const { query, body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const sanitize = require('sanitize-html'); // Install sanitize-html package

// Rate limiting middleware for the POST /logStoppage route
const logStoppageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// GET /stoppageLogs - Fetch stoppage logs with validation and pagination
router.get('/stoppageLogs',
  authenticateToken,
  [
    query('shiftId').trim().notEmpty().withMessage('Shift ID is required').isNumeric().withMessage('Shift ID must be numeric'),
    query('machineId').trim().notEmpty().withMessage('Machine ID is required').isNumeric().withMessage('Machine ID must be numeric'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page number must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer').toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shiftId, machineId, page = 1, limit = 10 } = req.query;
    try {
      const stoppageLogs = await getStoppageLogsFromDatabase(shiftId, machineId, page, limit);
      res.json(stoppageLogs);
    } catch (error) {
      logger.error('Error fetching stoppage logs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// POST /logStoppage - Create a new stoppage log with rate limiting and sanitization
router.post('/logStoppage',
  authenticateToken,
  logStoppageRateLimiter,
  [
    body('shiftId').notEmpty().withMessage('Shift ID is required').isNumeric().withMessage('Shift ID must be numeric'),
    body('machineId').notEmpty().withMessage('Machine ID is required').isNumeric().withMessage('Machine ID must be numeric'),
    body('stoppageReason').notEmpty().withMessage('Stoppage reason is required').customSanitizer(value => sanitize(value, { allowedTags: [], allowedAttributes: {} }))
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await stoppageLogController.createStoppageLog(req, res);
    } catch (error) {
      logger.error('Error creating stoppage log:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

async function getStoppageLogsFromDatabase(shiftId, machineId, page, limit) {
  const offset = (page - 1) * limit;
  const query = 'SELECT * FROM stoppage_logs WHERE shiftId = ? AND machineId = ? LIMIT ? OFFSET ?';
  const [results] = await db.execute(query, [shiftId, machineId, limit, offset]);
  return results;
}

module.exports = router;



