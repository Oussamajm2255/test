const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Unauthorized' });
  }


  const secretKey = process.env.SECRET_KEY;

  jwt.verify(token, secretKey, (err, shift) => {
    if (err) {
      console.error('Error verifying token:', err.message);
      return res.status(403).json({ message: 'Forbidden' });
    }
    console.log('Shift authenticated:', shift);
    req.shift = shift; 
    next(); 
  });
};

module.exports = authenticateToken;




