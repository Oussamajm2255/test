const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const app = express();
const db = require('./config/database');
const authenticateToken = require('./middleware/authenticateToken');
const winston = require('winston');
const { body, validationResult } = require('express-validator');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Set up a logger with winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

app.use(cors({
  origin: ['*', 'http://127.0.0.1:3000'], // Replace '*' with specific URLs if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Use helmet for security best practices
app.use(helmet());

// Middleware to extract and log machine identifier
app.use((req, res, next) => {
  req.machineIdentifier = req.headers['x-machine-identifier'] || 'Unknown PC';
  next();
});

// Import routes
const stoppageLogRoutes = require('./routes/stoppagelogRoutes');
const stoppageLogController = require('./controllers/stoppageLogController');
const usersRoutes = require('./routes/usersRoutes');
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/loginRoute');
const lectraRoutes = require('./routes/lectraRoutes');

// Use routes
app.use('/lectra', lectraRoutes);
app.use('/register', registerRoute);
app.use('/logStoppage', stoppageLogRoutes);
app.get('/stoppageLogs', stoppageLogController.getAllStoppageLogs);
app.post('/logStoppage', stoppageLogController.createStoppageLog);
app.use('/users', usersRoutes);
app.use('/login', loginRoute);

app.post('/logout', (req, res) => {
  res.json({ message: "Logout successful" });
});

app.get('/shiftData', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM shifts WHERE id = ?', [req.shift.shiftId]);
    const shift = rows[0];
    if (shift) {
      res.json({ shiftId: shift.id, shiftName: shift.shift_name });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    logger.error('Error retrieving shift data:', error);
    res.sendStatus(500);
  }
});

async function getStoppageLogsFromDatabase(shiftId, machineId) {
  const query = 'SELECT * FROM stoppage_logs WHERE shiftId = ? AND machineId = ?';
  const [results] = await db.execute(query, [shiftId, machineId]);
  return results;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Add a simple route to verify server is running
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});
