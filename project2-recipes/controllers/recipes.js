const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db/connect');

const COLLECTION = 'recipes';

// Copies only the fields we allow. Saving req.body straight into Mongo would
// let a client sneak extra fields into the document.
const buildRecipe = (body) => ({
  title: body.title.trim(),
  description: body.description.trim(),
  cuisine: body.cuisine.trim(),
  difficulty: body.difficulty,
  prepMinutes: body.prepMinutes,
  cookMinutes: body.cookMinutes,
  servings: body.servings,
  ingredients: body.ingredients.map((i) => i.trim()),
  instructions: body.instructions.map((i) => i.trim()),
  chefId: body.chefId
});

// GET /recipes
const getAll = async (req, res) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Get all recipes'
  try {
    const cursor = await getDatabase().collection(COLLECTION).find();
    const recipes = await cursor.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get recipes.', error: err.message });
  }
};

// GET /recipes/:id
const getSingle = async (req, res) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Get a single recipe by id'
  try {
    const recipe = await getDatabase()
      .collection(COLLECTION)
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

// POST /recipes
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

    // chefId passed the format check in the middleware, but that only proves
    // it LOOKS like an id. Make sure the chef actually exists.
    const chef = await db.collection('chefs').findOne({ _id: new ObjectId(req.body.chefId) });
    if (!chef) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: ['chefId does not match any chef in the database.']
      });
    }

    const result = await db.collection(COLLECTION).insertOne(buildRecipe(req.body));
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create recipe.', error: err.message });
  }
};

// PUT /recipes/:id
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
      .collection(COLLECTION)
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: buildRecipe(req.body) });

    // matchedCount answers "does this id exist". modifiedCount would be 0 when
    // someone re-sends identical data, which is still a successful update.
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Failed to update recipe.', error: err.message });
  }
};

// DELETE /recipes/:id
const deleteRecipe = async (req, res) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Delete a recipe by id'
  try {
    const result = await getDatabase()
      .collection(COLLECTION)
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
