// controllers/shiftController.js
const db = require('../config/database');
const logger = require('../config/logger'); // Ensure you have a logger for consistent logging

const getShiftData = async (req, res) => {
  try {
    // Retrieve shiftId from the request object
    const shiftId = req.shift.shiftId;

    // Validate shiftId to ensure it's a number
    if (!Number.isInteger(shiftId) || shiftId <= 0) {
      return res.status(400).json({ error: 'Invalid shift ID' });
    }

    // Fetch data from the shifts table based on shiftId
    const [rows] = await db.query('SELECT * FROM shifts WHERE id = ?', [shiftId]);
    const shift = rows[0];

    if (shift) {
      // Return the shift data as JSON response
      res.json({ shiftId: shift.id, shiftName: shift.shift_name });
    } else {
      // Return 404 if shift is not found
      res.status(404).json({ message: 'Shift not found' });
    }
  } catch (error) {
    // Log the error and return a 500 status code
    logger.error('Error retrieving shift data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getShiftData,
};

