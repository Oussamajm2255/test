const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const usersController = require('../controllers/usersController');

// Example console log to check if the router is being accessed
console.log('Inside usersRoutes.js');

// Protected route to fetch user information
router.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await usersController.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      userId: user.userId,
      username: user.username,
      role: user.role,
      // Include other user details as needed
    });
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Other routes with console logs for debugging
router.get('/', authenticateToken, async (req, res) => {
  console.log('Inside GET / route');
  try {
    const users = await usersController.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Ensure other routes are similarly debugged

module.exports = router;



