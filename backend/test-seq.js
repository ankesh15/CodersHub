const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const userRoutes = require('./routes/user');

dotenv.config();

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
console.log('URI:', mongoURI ? mongoURI.replace(/:([^:@]{8})[^:@]*@/, ':****@') : 'undefined');

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 }).then(async () => {
  console.log('Connected');
  try {
    const User = require('./models/User');
    const users = await User.find();
    console.log('Users:', users.length);
  } catch (err) {
    console.error('Find error:', err.message);
  }
  mongoose.disconnect();
}).catch(err => {
  console.error('Connection error:', err.message);
});
