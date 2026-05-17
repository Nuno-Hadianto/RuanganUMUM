const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const isBcryptHash = (value) => typeof value === 'string' && value.startsWith('$2');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const query = 'SELECT * FROM users WHERE username = ? LIMIT 1';
    const [rows] = await db.query(query, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const user = rows[0];
    const storedPassword = user.password;
    let passwordValid = false;

    if (isBcryptHash(storedPassword)) {
      passwordValid = await bcrypt.compare(password, storedPassword);
    } else {
      // Backward compatibility for old plaintext records.
      passwordValid = storedPassword === password;
      if (passwordValid) {
        const newHash = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
      }
    }

    if (!passwordValid) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT secret is not configured' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role || 'Administrator' },
      jwtSecret,
      { expiresIn: '8h' }
    );

    // Exclude password from response
    delete user.password;

    res.status(200).json({ 
      message: 'Login berhasil', 
      user,
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = {
  login
};
