const express = require('express');
const router = express.Router();
const recipes = require('../controllers/recipes');
const { validateRecipe, validateId } = require('../middleware/validate');

router.get('/', recipes.getAll);
router.get('/:id', validateId, recipes.getSingle);
router.post('/', validateRecipe, recipes.createRecipe);
router.put('/:id', validateId, validateRecipe, recipes.updateRecipe);
router.delete('/:id', validateId, recipes.deleteRecipe);

module.exports = router;
