const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // #swagger.tags = ['Hello World']
  res.send('Hello World');
});

// The interactive API documentation lives at /api-docs
router.use('/', require('./swagger'));

// Everything starting with /contacts is handled by the contacts route file.
router.use('/contacts', require('./contacts'));

module.exports = router;
