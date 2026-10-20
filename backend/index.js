require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true });
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { createApp } = require('./app');
mongoose.set('bufferCommands', false);
async function start() {
  let store;
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      store = MongoStore.create({ client: mongoose.connection.getClient(), dbName: mongoose.connection.name, collectionName: 'sessions' });
      store.on('error', () => console.error('Session store unavailable.'));
      console.log('MongoDB connected.');
    } catch {
      console.error('MongoDB unavailable. Check MONGO_URI, DNS, network access and database credentials.');
    }
  } else console.error('Set MONGO_URI to enable database-backed features.');
  if (!store && process.env.NODE_ENV === 'production') throw new Error('Production startup requires MongoDB.');
  const app = createApp({ store });
  const server = app.listen(process.env.PORT || 5000, () => console.log(`Server is running on port ${server.address().port}`));
  const stop = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  return server;
}
if (require.main === module) start().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { start };
