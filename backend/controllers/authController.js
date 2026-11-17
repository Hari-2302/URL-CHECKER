const User = require('../models/User');

// Email validation regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Strict Input Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address (e.g. user@domain.com).' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Fast check for existing user using indexed email
    const existing = await User.findOne({ email: cleanEmail }).select('_id').lean();
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in instead.' });
    }

    const initials = name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SA';

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: role && typeof role === 'string' && role.trim() ? role.trim() : 'Threat Intelligence Analyst',
      avatar: initials
    });

    return res.status(201).json({
      message: 'Account created successfully!',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Database registration failed. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Input Validation
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Please enter your password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Fast indexed query
    const user = await User.findOne({ email: cleanEmail }).lean();

    if (!user) {
      return res.status(404).json({ error: 'Account not found. Please register or check your email.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    return res.status(200).json({
      message: 'Signed in successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication query failed. Please check database connection.' });
  }
}

// Pre-seed demo user so login is immediately available
async function seedDemoUser() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create({
        name: 'Security Analyst',
        email: 'analyst@urlguard.io',
        password: 'password123',
        role: 'Threat Intelligence Analyst',
        avatar: 'SA'
      });
      console.log('Default demo user seeded: analyst@urlguard.io / password123');
    }
  } catch (err) {
    console.error('seedDemoUser error:', err.message);
  }
}

module.exports = { register, login, seedDemoUser };
