const { MongoClient } = require('mongodb');
require('dotenv').config();

// We store the connected client here so we only ever open ONE connection.
// Opening a new connection on every request would be slow and would
// eventually exhaust the database's connection limit.
let _db;

const initDb = async () => {
  if (_db) {
    console.log('Db is already initialized!');
    return _db;
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  _db = client.db(process.env.MONGODB_DBNAME || 'cse341');
  console.log('Connected to MongoDB');
  return _db;
};

// Any file that needs the database calls this to grab the shared connection.
const getDatabase = () => {
  if (!_db) {
    throw Error('Db not initialized. Call initDb first.');
  }
  return _db;
};

module.exports = { initDb, getDatabase };
