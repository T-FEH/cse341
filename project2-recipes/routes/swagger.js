const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// withCredentials makes the Try it out button send the login cookie.
// Without it the protected routes would answer 401 even after logging in.
const options = {
  swaggerOptions: {
    withCredentials: true,
    persistAuthorization: true
  }
};

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

module.exports = router;
