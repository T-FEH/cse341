const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db/connect');

// Only copy the fields we want so nothing extra gets saved
function buildRecipe(body) {
  return {
    title: body.title.trim(),
    description: body.description.trim(),
    cuisine: body.cuisine.trim(),
    difficulty: body.difficulty,
    prepMinutes: body.prepMinutes,
    cookMinutes: body.cookMinutes,
    servings: body.servings,
    ingredients: body.ingredients,
    instructions: body.instructions,
    chefId: body.chefId
  };
}

const getAll = async (req, res) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Get all recipes'
  try {
    const result = await getDatabase().collection('recipes').find();
    const recipes = await result.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get recipes.', error: err.message });
  }
};

const getSingle = async (req, res) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Get a single recipe by id'
  try {
    const recipe = await getDatabase()
      .collection('recipes')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get recipe.', error: err.message });
  }
};

const createRecipe = async (req, res) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Create a new recipe'
  /*  #swagger.requestBody = {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/Recipe" } } }
      }
  */
  try {
    const db = getDatabase();

    // Make sure the chef actually exists before saving the recipe
    const chef = await db.collection('chefs').findOne({ _id: new ObjectId(req.body.chefId) });
    if (!chef) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: ['chefId does not match any chef in the database.']
      });
    }

    const result = await db.collection('recipes').insertOne(buildRecipe(req.body));
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create recipe.', error: err.message });
  }
};

const updateRecipe = async (req, res) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Update a recipe by id'
  /*  #swagger.requestBody = {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/Recipe" } } }
      }
  */
  try {
    const db = getDatabase();

    const chef = await db.collection('chefs').findOne({ _id: new ObjectId(req.body.chefId) });
    if (!chef) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: ['chefId does not match any chef in the database.']
      });
    }

    const result = await db
      .collection('recipes')
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: buildRecipe(req.body) });

    // matchedCount tells us if the id exists. modifiedCount would be 0
    // when someone sends the same data again, which is still fine.
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Failed to update recipe.', error: err.message });
  }
};

const deleteRecipe = async (req, res) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Delete a recipe by id'
  try {
    const result = await getDatabase()
      .collection('recipes')
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.status(200).json({ message: 'Recipe deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete recipe.', error: err.message });
  }
};

module.exports = { getAll, getSingle, createRecipe, updateRecipe, deleteRecipe };
