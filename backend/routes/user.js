const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Register a new user with password
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, profile, password, leetcode, codeforces, github } = req.body;
    if (!name || !email || !profile || !password) {
      return res.status(400).json({ error: 'Name, email, profile handle, and password are required.' });
    }

    // Check if user already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const existingProfile = await User.findOne({ profile: profile.toLowerCase().trim() });
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile handle already taken.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      profile: profile.toLowerCase().trim(),
      password: hashedPassword,
      leetcode: leetcode?.toLowerCase().trim() || '',
      codeforces: codeforces?.toLowerCase().trim() || '',
      github: github?.toLowerCase().trim() || '',
      bookmarks: [],
      achievements: []
    });

    await user.save();
    
    // Set user session
    req.session.userId = user._id;
    
    // Omit password from output
    const userResponse = user.toObject();
    delete userResponse.password;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session save failed' });
      }
      res.status(201).json({ message: 'User registered successfully', user: userResponse });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login user
router.post('/auth/login', async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId can be email or profile handle
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    // Find user by email or profile
    const user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase().trim() },
        { profile: loginId.toLowerCase().trim() }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/profile or password.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/profile or password.' });
    }

    // Set user session
    req.session.userId = user._id;

    // Omit password from output
    const userResponse = user.toObject();
    delete userResponse.password;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session save failed' });
      }
      res.status(200).json({ message: 'Login successful', user: userResponse });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch current session user
router.get('/auth/me', async (req, res) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        return res.json({ user });
      }
    }
    // Fallback to passport (GitHub OAuth)
    if (req.isAuthenticated() && req.user) {
      // Find or create user from GitHub details
      const githubUsername = req.user.username;
      let user = await User.findOne({ github: githubUsername.toLowerCase() });
      if (!user) {
        // Create a shell user profile
        const email = req.user.emails?.[0]?.value || `${githubUsername}@github.com`;
        const name = req.user.displayName || githubUsername;
        user = new User({
          name,
          email,
          profile: githubUsername.toLowerCase(),
          github: githubUsername.toLowerCase(),
          bookmarks: [],
          achievements: []
        });
        await user.save();
      }
      const userResponse = user.toObject();
      delete userResponse.password;
      return res.json({ user: userResponse });
    }
    res.status(401).json({ error: 'Not authenticated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout user
router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to destroy session' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Toggle Bookmark
router.post('/user/bookmark', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Login required to bookmark profiles.' });
    }
    const { targetProfile } = req.body;
    if (!targetProfile) {
      return res.status(400).json({ error: 'Target profile is required.' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const index = user.bookmarks.indexOf(targetProfile);
    if (index > -1) {
      user.bookmarks.splice(index, 1); // Remove if exists
    } else {
      user.bookmarks.push(targetProfile); // Add if doesn't exist
    }

    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile usernames
router.post('/user/update', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Login required.' });
    }
    const { name, leetcode, codeforces, github } = req.body;

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (leetcode !== undefined) user.leetcode = leetcode.toLowerCase().trim();
    if (codeforces !== undefined) user.codeforces = codeforces.toLowerCase().trim();
    if (github !== undefined) user.github = github.toLowerCase().trim();

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ message: 'Profile updated successfully', user: userResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch user by profile
router.post('/user', async (req, res) => {
  try {
    const { profile } = req.body;
    const user = await User.findOne({ profile: profile.toLowerCase().trim() }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GitHub OAuth login
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

// Leaderboard: Get all users sorted by createdAt (newest first)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;