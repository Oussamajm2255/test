// controllers/usersController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // Ensure the path is correct
const logger = require('../config/logger'); // Consistent logging

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if the user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    logger.info('User registered successfully:', { username });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error('Error in register controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Login a user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Fetch user from the database
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    // Validate user and password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with 8 hours expiration
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' });

    logger.info('User logged in successfully:', { username });

    res.json({ token });
  } catch (error) {
    logger.error('Error in login controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





