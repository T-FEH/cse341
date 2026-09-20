const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // #swagger.tags = ['Health']
  // #swagger.summary = 'Health check'
  res.json({
    message: 'Recipe Box API is running.',
    documentation: '/api-docs'
  });
});

router.use('/', require('./swagger'));
router.use('/recipes', require('./recipes'));
router.use('/chefs', require('./chefs'));

module.exports = router;
