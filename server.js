const express = require('express');
const { initDb } = require('./db/connect');
require('dotenv').config();

const app = express();

// Render (and most hosts) tell us which port to use via an environment
// variable. Fall back to 3000 when running on our own machine.
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS: lets a browser on another domain call this API.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use('/', require('./routes'));

// Connect to Mongo FIRST, then start listening. If the database is
// unreachable there is no point accepting requests.
initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Web server is listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });
