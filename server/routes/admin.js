const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const ADMIN_USER = {
  username: 'admin',
  password: 'ksreddy@2004'
};

// ✅ Add this ping route for testing
router.get('/ping', (req, res) => {
  console.log('✅ /api/admin/ping HIT');
  res.send('pong');
});

router.post('/login', (req, res) => {
  console.log('🛠️ /api/admin/login HIT');
  const { username, password } = req.body;

  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
