const { MongoClient } = require('mongodb');
require('dotenv').config();

// Keep one connection and reuse it instead of opening a new
// one on every request
let _db;

const initDb = async () => {
  if (_db) {
    console.log('Db is already initialized!');
    return _db;
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  _db = client.db(process.env.MONGODB_DBNAME);
  console.log('Connected to MongoDB');
  return _db;
};

const getDatabase = () => {
  if (!_db) {
    throw Error('Db not initialized. Call initDb first.');
  }
  return _db;
};

module.exports = { initDb, getDatabase };
