const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 1, username: 'admin', role: 'Admin' },
  'pos-market-jwt-secret-nhom8b-2026',
  { expiresIn: '8h' }
);
console.log('Token:', token);
