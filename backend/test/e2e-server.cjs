const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createApp } = require('../app');
(async () => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: 'codershub_browser_test' });
  await require('../models/User').init();
  const server = createApp().listen(5051, '127.0.0.1', () => console.log('Browser test backend ready'));
  const stop = () => server.close(async () => { await mongoose.disconnect(); await mongo.stop(); process.exit(0); });
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
