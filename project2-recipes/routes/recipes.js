const express = require('express');
const router = express.Router();
const recipes = require('../controllers/recipes');
const { validateRecipe, validateId } = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/auth');

// Reading is open to everyone. Anything that changes data needs a login.
router.get('/', recipes.getAll);
router.get('/:id', validateId, recipes.getSingle);
router.post('/', isAuthenticated, validateRecipe, recipes.createRecipe);
router.put('/:id', isAuthenticated, validateId, validateRecipe, recipes.updateRecipe);
router.delete('/:id', isAuthenticated, validateId, recipes.deleteRecipe);

module.exports = router;
