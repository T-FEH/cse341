const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World');
});

// Everything starting with /contacts is handled by the contacts route file.
router.use('/contacts', require('./contacts'));

module.exports = router;
