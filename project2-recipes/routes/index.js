const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // #swagger.tags = ['Health']
  // #swagger.summary = 'Health check'
  res.json({
    message: 'Recipe Box API is running.',
    documentation: '/api-docs',
    loggedIn: req.isAuthenticated ? req.isAuthenticated() : false
  });
});

router.use('/', require('./swagger'));
router.use('/', require('./auth'));
router.use('/recipes', require('./recipes'));
router.use('/chefs', require('./chefs'));

module.exports = router;
