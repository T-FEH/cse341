const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db/connect');

function buildChef(body) {
  return {
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.trim().toLowerCase(),
    specialty: body.specialty.trim(),
    yearsExperience: body.yearsExperience,
    bio: body.bio.trim()
  };
}

const getAll = async (req, res) => {
  // #swagger.tags = ['Chefs']
  // #swagger.summary = 'Get all chefs'
  try {
    const result = await getDatabase().collection('chefs').find();
    const chefs = await result.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(chefs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get chefs.', error: err.message });
  }
};

const getSingle = async (req, res) => {
  // #swagger.tags = ['Chefs']
  // #swagger.summary = 'Get a single chef by id'
  try {
    const chef = await getDatabase()
      .collection('chefs')
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

    // Two chefs with the same email would be confusing
    const existing = await db.collection('chefs').findOne({ email: chef.email });
    if (existing) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: ['email is already used by another chef.']
      });
    }

    const result = await db.collection('chefs').insertOne(chef);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create chef.', error: err.message });
  }
};

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

    // Skip the chef we are editing, otherwise saving without
    // changing the email would fail
    const existing = await db.collection('chefs').findOne({
      email: chef.email,
      _id: { $ne: chefId }
    });
    if (existing) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: ['email is already used by another chef.']
      });
    }

    const result = await db.collection('chefs').updateOne({ _id: chefId }, { $set: chef });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Chef not found.' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Failed to update chef.', error: err.message });
  }
};

const deleteChef = async (req, res) => {
  // #swagger.tags = ['Chefs']
  // #swagger.summary = 'Delete a chef by id'
  try {
    const db = getDatabase();

    // Do not leave recipes pointing at a chef that no longer exists
    const recipeCount = await db.collection('recipes').countDocuments({ chefId: req.params.id });
    if (recipeCount > 0) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: ['This chef still has ' + recipeCount + ' recipe(s). Delete them first.']
      });
    }

    const result = await db.collection('chefs').deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Chef not found.' });
    }

    res.status(200).json({ message: 'Chef deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chef.', error: err.message });
  }
};

module.exports = { getAll, getSingle, createChef, updateChef, deleteChef };
