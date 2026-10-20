const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const session = require('express-session');
const { Passport } = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { rateLimit } = require('express-rate-limit');
const { randomBytes } = require('crypto');
const axios = require('axios');
const User = require('./models/User');
const { resolveGithubUser } = require('./lib/oauth');
const { runtimeConfig } = require('./lib/config');

function createApp({ store, databaseReady = () => mongoose.connection.readyState === 1 } = {}) {
  const app = express();
  const { production, frontendUrl, backendUrl, oauthEnabled } = runtimeConfig();
  if (production && !store) throw new Error('Production requires a persistent session store.');
  if (production) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  // CORS alone does not reject state-changing cross-origin requests.
  app.use((req, res, next) => {
    if (req.headers.origin && req.headers.origin !== frontendUrl) return res.status(403).json({ error: 'Origin is not allowed.' });
    next();
  });
  app.use(cors({ origin: frontendUrl, credentials: true }));
  app.use(express.json({ limit: '16kb' }));
  app.use((req, res, next) => {
    if (req.method === 'POST' && !req.is('application/json') && req.path !== '/api/auth/logout') {
      return res.status(415).json({ error: 'Content-Type must be application/json.' });
    }
    if (req.method === 'POST' && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) req.body = {};
    next();
  });
  const cookie = { httpOnly: true, secure: production, sameSite: production ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 };
  app.locals.cookieOptions = { httpOnly: cookie.httpOnly, secure: cookie.secure, sameSite: cookie.sameSite, path: '/' };
  app.locals.frontendUrl = frontendUrl;
  app.locals.databaseReady = databaseReady;
  app.use(session({ secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'), store, resave: false, saveUninitialized: false, cookie }));
  const passport = new Passport();
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => done(null, user._id.toString()));
  passport.deserializeUser(async (id, done) => {
    if (!databaseReady()) return done(null, false);
    try { done(null, await User.findById(id).select('-password')); } catch (error) { done(error); }
  });
  app.locals.oauthEnabled = oauthEnabled;
  if (oauthEnabled) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${backendUrl}/api/auth/github/callback`,
      state: true,
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const emailResponse = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` }, timeout: 10000,
        });
        const email = emailResponse.data.find(item => item.primary && item.verified)?.email;
        done(null, await resolveGithubUser(profile, email));
      } catch (error) { done(error); }
    }));
  }
  app.get('/', (req, res) => res.send('Coders Profile Hub Backend is running!'));
  app.get('/api/health', (req, res) => res.status(databaseReady() ? 200 : 503).json({ status: databaseReady() ? 'ok' : 'degraded', database: databaseReady() ? 'connected' : 'unavailable' }));
  app.use('/api/auth', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many authentication requests. Please try again later.' } }));
  app.use('/api', require('./routes/user')(passport));
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many platform requests. Please try again shortly.' } }), require('./routes/platforms'));
  app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 11000) return res.status(409).json({ error: 'Email or profile handle already registered.' });
    const status = error.status || (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
    res.status(status).json({ error: status < 500 ? error.message : 'Request failed. Please try again later.' });
  });
  return app;
}
module.exports = { createApp };
