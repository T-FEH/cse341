const express = require('express');
const { initDb } = require('./db/connect');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// If the body is not valid JSON, express.json() throws before any route runs.
// Catch it here so the client gets a clear 400 instead of a stack trace.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: ['Request body is not valid JSON.']
    });
  }
  next(err);
});

// CORS: lets a browser on another domain call this API.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use('/', require('./routes'));

// Nothing matched any route above.
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Last line of defence. Every controller has its own try/catch, but if
// something unexpected slips through, this keeps the server alive and still
// answers with JSON instead of crashing.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong on the server.', error: err.message });
});

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
