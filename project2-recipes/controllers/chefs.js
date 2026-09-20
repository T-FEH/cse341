const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db/connect');

const COLLECTION = 'chefs';

const buildChef = (body) => ({
  firstName: body.firstName.trim(),
  lastName: body.lastName.trim(),
  email: body.email.trim().toLowerCase(),
  specialty: body.specialty.trim(),
  yearsExperience: body.yearsExperience,
  bio: body.bio.trim()
});

// GET /chefs
const getAll = async (req, res) => {
  // #swagger.tags = ['Chefs']
  // #swagger.summary = 'Get all chefs'
  try {
    const cursor = await getDatabase().collection(COLLECTION).find();
    const chefs = await cursor.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(chefs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get chefs.', error: err.message });
  }
};

// GET /chefs/:id
const getSingle = async (req, res) => {
  // #swagger.tags = ['Chefs']
  // #swagger.summary = 'Get a single chef by id'
  try {
    const chef = await getDatabase()
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!chef) {
      return res.status(404).json({ message: 'Chef not found.' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(chef);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get chef.', error: err.message });
  }
};

// POST /chefs
const createChef = async (req, res) => {
  // #swagger.tags = ['Chefs']
  // #swagger.summary = 'Create a new chef'
  /*  #swagger.requestBody = {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/Chef" } } }
      }
  */
  try {
    const db = getDatabase();
    const chef = buildChef(req.body);

    // Two chefs sharing an email would make the data confusing, so reject it.
    const existing = await db.collection(COLLECTION).findOne({ email: chef.email });
    if (existing) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: ['email is already used by another chef.']
      });
    }

    const result = await db.collection(COLLECTION).insertOne(chef);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create chef.', error: err.message });
  }
};

// PUT /chefs/:id
const updateChef = async (req, res) => {
  // #swagger.tags = ['Chefs']
  // #swagger.summary = 'Update a chef by id'
  /*  #swagger.requestBody = {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/Chef" } } }
      }
  */
  try {
    const db = getDatabase();
    const chefId = new ObjectId(req.params.id);
    const chef = buildChef(req.body);

    // Same email check, but ignore the chef we are currently editing -
    // otherwise saving a chef without changing their email would fail.
    const existing = await db.collection(COLLECTION).findOne({
      email: chef.email,
      _id: { $ne: chefId }
    });
    if (existing) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: ['email is already used by another chef.']
      });
    }

    const result = await db.collection(COLLECTION).updateOne({ _id: chefId }, { $set: chef });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Chef not found.' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Failed to update chef.', error: err.message });
  }
};

// DELETE /chefs/:id
const deleteChef = async (req, res) => {
  // #swagger.tags = ['Chefs']
  // #swagger.summary = 'Delete a chef by id'
  try {
    const db = getDatabase();
    const chefId = new ObjectId(req.params.id);

    // Deleting a chef who still owns recipes would leave those recipes
    // pointing at nothing, so block it and say why.
    const recipeCount = await db.collection('recipes').countDocuments({ _id: { $exists: true }, chefId: req.params.id });
    if (recipeCount > 0) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: [`This chef still has ${recipeCount} recipe(s). Delete or reassign them first.`]
      });
    }

    const result = await db.collection(COLLECTION).deleteOne({ _id: chefId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Chef not found.' });
    }

    res.status(200).json({ message: 'Chef deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chef.', error: err.message });
  }
};

module.exports = { getAll, getSingle, createChef, updateChef, deleteChef };
