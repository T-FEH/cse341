const express = require('express');
const router = express.Router();
const chefs = require('../controllers/chefs');
const { validateChef, validateId } = require('../middleware/validate');

router.get('/', chefs.getAll);
router.get('/:id', validateId, chefs.getSingle);
router.post('/', validateChef, chefs.createChef);
router.put('/:id', validateId, validateChef, chefs.updateChef);
router.delete('/:id', validateId, chefs.deleteChef);

module.exports = router;
