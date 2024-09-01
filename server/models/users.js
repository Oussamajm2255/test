// models/users.js
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

const Users = {
  // Get all users
  getAllUsers: async () => {
    const query = 'SELECT * FROM users';
    try {
      const results = await executeQuery(query);
      return results;
    } catch (error) {
      throw new Error('Error retrieving users');
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    try {
      const results = await executeQuery(query, [id]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw new Error('Error retrieving user');
    }
  },

  // Create a new user
  createUser: async (data) => {
    const query = 'INSERT INTO users SET ?';
    try {
      const result = await executeQuery(query, data);
      return result.insertId;
    } catch (error) {
      throw new Error('Error creating user');
    }
  },

  // Update user by ID
  updateUser: async (id, data) => {
    const query = 'UPDATE users SET ? WHERE id = ?';
    try {
      const result = await executeQuery(query, [data, id]);
      return result.affectedRows ? result : null;
    } catch (error) {
      throw new Error('Error updating user');
    }
  },

  // Delete user by ID
  deleteUser: async (id) => {
    const query = 'DELETE FROM users WHERE id = ?';
    try {
      const result = await executeQuery(query, [id]);
      return result.affectedRows ? result : null;
    } catch (error) {
      throw new Error('Error deleting user');
    }
  }
};

module.exports = Users;

