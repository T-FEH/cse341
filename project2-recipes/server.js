const express = require('express');
const { initDb } = require('./db/connect');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// express.json() throws if the body is not valid JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: ['Request body is not valid JSON.']
    });
  }
  next(err);
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use('/', require('./routes'));

// Nothing above matched
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found: ' + req.method + ' ' + req.originalUrl });
});

// Catches anything the controllers missed
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong on the server.', error: err.message });
});

// Connect to the database first, then start listening
initDb()
  .then(() => {
    app.listen(port, () => {
      console.log('Web server is listening on port ' + port);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });
