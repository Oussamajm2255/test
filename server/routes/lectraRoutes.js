const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const lectraController = require('../controllers/lectraController');
const { check, validationResult } = require('express-validator');


router.get(
  '/lectraData/:lectraNumber',
  [
    authenticateToken,
    
    check('lectraNumber').isNumeric().withMessage('Lectra number must be numeric')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  lectraController.getLectraData
);

module.exports = router;

