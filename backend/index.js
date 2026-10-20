require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true });
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { createApp } = require('./app');
const { runtimeConfig } = require('./lib/config');
mongoose.set('bufferCommands', false);
async function start() {
  // Validate before opening sockets so invalid production settings exit promptly.
  const { production } = runtimeConfig();
  let store;
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (production && !uri) throw new Error('Production requires MONGO_URI (or MONGODB_URI).');
  try {
    if (uri) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        store = MongoStore.create({ client: mongoose.connection.getClient(), dbName: mongoose.connection.name, collectionName: 'sessions' });
        store.on('error', () => console.error('Session store unavailable.'));
        // Wait for the session TTL index before serving or closing this client.
        await store.collectionP;
        console.log('MongoDB connected.');
      } catch {
        store = undefined;
        console.error('MongoDB unavailable. Check MONGO_URI, DNS, network access and database credentials.');
      }
    } else console.error('Set MONGO_URI to enable database-backed features.');
    if (!store && production) throw new Error('Production startup requires MongoDB.');
    const app = createApp({ store });
    const server = app.listen(process.env.PORT || 5000);
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
    console.log(`Server is running on port ${server.address().port}`);
    const stop = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
    process.once('SIGTERM', stop);
    process.once('SIGINT', stop);
    return server;
  } catch (error) {
    await mongoose.disconnect();
    throw error;
  }
}
if (require.main === module) start().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { start };
