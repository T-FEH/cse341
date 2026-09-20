const express = require('express');
const router = express.Router();
const recipes = require('../controllers/recipes');
const { validateRecipe, validateId } = require('../middleware/validate');

// Express runs the middleware left to right, so by the time the controller
// runs, the id and the body have already been checked.
router.get('/', recipes.getAll);
router.get('/:id', validateId, recipes.getSingle);
router.post('/', validateRecipe, recipes.createRecipe);
router.put('/:id', validateId, validateRecipe, recipes.updateRecipe);
router.delete('/:id', validateId, recipes.deleteRecipe);

module.exports = router;
