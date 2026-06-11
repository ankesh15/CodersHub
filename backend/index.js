const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const userRoutes = require('./routes/user');
const platformsRoutes = require('./routes/platforms');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-for-development-only',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'GITHUB_CLIENT_ID',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'GITHUB_CLIENT_SECRET',
  callbackURL: 'http://localhost:5000/api/auth/github/callback'
},
(accessToken, refreshToken, profile, done) => {
  // You can save the user to your DB here
  return done(null, profile);
}
));

// Health check route
app.get('/', (req, res) => {
  res.send('Coders Profile Hub Backend is running!');
});

// MongoDB connection
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB with URI:', mongoURI ? mongoURI.replace(/:([^:@]{8})[^:@]*@/, ':****@') : 'undefined');

if (!mongoURI) {
  console.error('ERROR: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
.then(() => console.log('MongoDB Atlas connection established successfully.'))
.catch((err) => console.error('MongoDB Atlas connection error:', err));

app.use('/api', userRoutes);
app.use('/api', platformsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 