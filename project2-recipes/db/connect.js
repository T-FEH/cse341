const { MongoClient } = require('mongodb');
require('dotenv').config();

// Store the connected database here so we only open ONE connection.
// Opening a new one per request would be slow and would eventually
// exhaust the cluster's connection limit.
let _db;

const initDb = async () => {
  if (_db) {
    console.log('Db is already initialized!');
    return _db;
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  _db = client.db(process.env.MONGODB_DBNAME || 'recipebox');
  console.log('Connected to MongoDB ->', process.env.MONGODB_DBNAME);
  return _db;
};

// Any file needing the database calls this to borrow the shared connection.
const getDatabase = () => {
  if (!_db) {
    throw Error('Db not initialized. Call initDb first.');
  }
  return _db;
};

module.exports = { initDb, getDatabase };
