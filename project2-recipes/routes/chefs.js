const express = require('express');
const router = express.Router();
const chefs = require('../controllers/chefs');
const { validateChef, validateId } = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', chefs.getAll);
router.get('/:id', validateId, chefs.getSingle);
router.post('/', isAuthenticated, validateChef, chefs.createChef);
router.put('/:id', isAuthenticated, validateId, validateChef, chefs.updateChef);
router.delete('/:id', isAuthenticated, validateId, chefs.deleteChef);

module.exports = router;
