// models/stoppageLog.js
const db = require('../config/database');
const logger = require('../config/logger');

// Helper function to execute queries
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        logger.error('Database query error:', err);
        return reject(err);
      }
      resolve(results);
    });
  });
};

const StoppageLog = {
  // Get all stoppage logs
  getAllStoppageLogs: async () => {
    const query = 'SELECT * FROM stoppageLog';
    try {
      const results = await executeQuery(query);
      return results;
    } catch (error) {
      throw new Error('Error retrieving stoppage logs');
    }
  },

  // Get a stoppage log by ID
  getStoppageLogById: async (id) => {
    const query = 'SELECT * FROM stoppageLog WHERE id = ?';
    try {
      const results = await executeQuery(query, [id]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw new Error('Error retrieving stoppage log');
    }
  },

  // Create a new stoppage log
  createStoppageLog: async (data) => {
    const query = 'INSERT INTO stoppageLog SET ?';
    try {
      const result = await executeQuery(query, data);
      return result.insertId;
    } catch (error) {
      throw new Error('Error creating stoppage log');
    }
  },

  // Update a stoppage log
  updateStoppageLog: async (id, data) => {
    const query = 'UPDATE stoppageLog SET ? WHERE id = ?';
    try {
      const result = await executeQuery(query, [data, id]);
      return result.affectedRows ? result : null;
    } catch (error) {
      throw new Error('Error updating stoppage log');
    }
  },

  // Delete a stoppage log
  deleteStoppageLog: async (id) => {
    const query = 'DELETE FROM stoppageLog WHERE id = ?';
    try {
      const result = await executeQuery(query, [id]);
      return result.affectedRows ? result : null;
    } catch (error) {
      throw new Error('Error deleting stoppage log');
    }
  }
};

module.exports = StoppageLog;
