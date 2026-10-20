const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 }).then(async () => {
  console.log('Connected');
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
  } catch (err) {
    console.error('List collections error:', err.message);
  }
  mongoose.disconnect();
}).catch(err => {
  console.error('Connection error:', err.message);
});
