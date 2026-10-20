const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { text, handle, password: validatePassword } = require('../lib/validation');

const publicFields = 'name profile leetcode codeforces github achievements createdAt';
function privateUser(user) {
  const result = user.toObject();
  delete result.password;
  delete result.githubId;
  return result;
}
const db = (req, res, next) => req.app.locals.databaseReady() ? next() : res.status(503).json({ error: 'Database unavailable. Please try again later.' });
const authenticated = (req, res, next) => {
  const id = req.session.userId || req.user?._id;
  if (!id) return res.status(401).json({ error: 'Login required.' });
  req.accountId = id;
  next();
};
function establishSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate(error => {
      if (error) return reject(error);
      req.session.userId = user._id.toString();
      req.session.save(error => error ? reject(error) : resolve());
    });
  });
}
module.exports = passport => {
  const router = express.Router();
  router.post('/auth/register', async (req, res, next) => {
    try {
      const name = text(req.body.name, 'Name');
      const email = text(req.body.email, 'Email', { max: 254 }).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required.' });
      const profile = handle(req.body.profile);
      const password = validatePassword(req.body.password, true);
      const handles = {};
      for (const key of ['leetcode', 'codeforces', 'github']) handles[key] = handle(req.body[key], `${key} username`, false);
      if (!req.app.locals.databaseReady()) return db(req, res, next);
      if (await User.findOne({ $or: [{ email }, { profile }] })) return res.status(409).json({ error: 'Email or profile handle already registered.' });
      const user = await User.create({ name, email, profile, password: await bcrypt.hash(password, 10), ...handles });
      await establishSession(req, user);
      res.status(201).json({ message: 'User registered successfully', user: privateUser(user) });
    } catch (error) { next(error); }
  });
  router.post('/auth/login', async (req, res, next) => {
    try {
      const loginId = text(req.body.loginId, 'Username/Email', { max: 254 }).toLowerCase();
      const password = validatePassword(req.body.password);
      if (!req.app.locals.databaseReady()) return db(req, res, next);
      const user = await User.findOne({ $or: [{ email: loginId }, { profile: loginId }] });
      if (!user?.password || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid email/profile or password.' });
      await establishSession(req, user);
      res.json({ message: 'Login successful', user: privateUser(user) });
    } catch (error) { next(error); }
  });
  router.get('/auth/me', async (req, res, next) => {
    if (!req.session.userId && !req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!req.app.locals.databaseReady()) return db(req, res, next);
    try {
      const user = req.user || await User.findById(req.session.userId).select('-password');
      if (!user) return res.status(401).json({ error: 'Not authenticated' });
      res.json({ user: privateUser(user) });
    } catch (error) { next(error); }
  });
  router.post('/auth/logout', (req, res, next) => {
    req.session.destroy(error => {
      if (error) return next(error);
      res.clearCookie('connect.sid', req.app.locals.cookieOptions);
      res.json({ message: 'Logged out successfully' });
    });
  });
  router.post('/user/bookmark', authenticated, async (req, res, next) => {
    try {
      const targetProfile = handle(req.body.targetProfile);
      if (!req.app.locals.databaseReady()) return db(req, res, next);
      const user = await User.findById(req.accountId);
      if (!user) return res.status(401).json({ error: 'Not authenticated' });
      // Use a single atomic update so concurrent toggles do not overwrite each other.
      if (!user.bookmarks.includes(targetProfile) && !await User.exists({ profile: targetProfile })) return res.status(404).json({ error: 'Target profile not found.' });
      const updated = await User.findOneAndUpdate({ _id: req.accountId }, [{ $set: { bookmarks: {
        $cond: [ { $in: [targetProfile, { $ifNull: ['$bookmarks', []] }] },
          { $setDifference: ['$bookmarks', [targetProfile]] },
          { $concatArrays: [{ $ifNull: ['$bookmarks', []] }, [targetProfile]] } ],
      } } }], { new: true });
      res.json({ bookmarks: updated.bookmarks });
    } catch (error) { next(error); }
  });
  router.post('/user/update', authenticated, async (req, res, next) => {
    try {
      const changes = {};
      if (req.body.name !== undefined) changes.name = text(req.body.name, 'Name');
      for (const key of ['leetcode', 'codeforces', 'github']) {
        if (req.body[key] !== undefined) changes[key] = handle(req.body[key], `${key} username`, false);
      }
      if (!req.app.locals.databaseReady()) return db(req, res, next);
      const user = await User.findByIdAndUpdate(req.accountId, { $set: changes }, { new: true, runValidators: true });
      if (!user) return res.status(401).json({ error: 'Not authenticated' });
      res.json({ message: 'Profile updated successfully', user: privateUser(user) });
    } catch (error) { next(error); }
  });
  router.post('/user', async (req, res, next) => {
    try {
      const profile = handle(req.body.profile);
      if (!req.app.locals.databaseReady()) return db(req, res, next);
      const user = await User.findOne({ profile }).select(publicFields);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) { next(error); }
  });
  const oauthReady = (req, res, next) => {
    if (!req.app.locals.oauthEnabled) return res.status(503).json({ error: 'GitHub OAuth is not configured.' });
    return db(req, res, next);
  };
  router.get('/auth/github', oauthReady, passport.authenticate('github', { scope: ['user:email'] }));
  router.get('/auth/github/callback', oauthReady, (req, res, next) => {
    passport.authenticate('github', (error, user) => {
      if (error || !user) return res.redirect(`${req.app.locals.frontendUrl}/login?oauth=failed`);
      req.logIn(user, error => {
        if (error) return next(error);
        req.session.userId = user._id.toString();
        req.session.save(error => error ? next(error) : res.redirect(`${req.app.locals.frontendUrl}/dashboard`));
      });
    })(req, res, next);
  });
  router.get('/users', db, async (req, res, next) => {
    try { res.json(await User.find().select(publicFields).sort({ createdAt: -1 })); } catch (error) { next(error); }
  });
  return router;
};
