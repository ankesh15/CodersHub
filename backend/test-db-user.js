const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 }).then(async () => {
  console.log('Connected');
  try {
    const users = await User.find();
    console.log('Users:', users.length);
  } catch (err) {
    console.error('Find error:', err.message);
  }
  mongoose.disconnect();
}).catch(err => {
  console.error('Connection error:', err.message);
});
