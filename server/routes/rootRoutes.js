const express = require('express');
const router = express.Router();

// GET /
router.get('/', (req, res) => {
  res.status(200).send('Server is up and running!');
});

// POST /logout (requires token authentication)
router.post('/logout', (req, res) => {
  // Optional: Implement token invalidation logic here
  res.status(200).json({ message: "Logout successful" });
});

module.exports = router;

