const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db/connect');

// The five fields every contact must have. Kept in one place so the
// POST and PUT routes can't drift apart.
const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'favoriteColor', 'birthday'];

// Returns an array of the field names that are missing or blank.
const findMissingFields = (body) => {
  return REQUIRED_FIELDS.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
};

// Builds a clean contact object. Doing this instead of saving req.body
// directly stops anyone from sneaking extra fields into the database.
const buildContact = (body) => ({
  firstName: body.firstName,
  lastName: body.lastName,
  email: body.email,
  favoriteColor: body.favoriteColor,
  birthday: body.birthday
});

// GET /contacts  ->  return every contact in the collection
const getAll = async (req, res) => {
  // #swagger.tags = ['Contacts']
  // #swagger.summary = 'Get all contacts'
  try {
    const result = await getDatabase().collection('contacts').find();
    const contacts = await result.toArray(); // cursor -> plain array
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get contacts.', error: err.message });
  }
};

// GET /contacts/:id  ->  return the one contact whose _id matches
const getSingle = async (req, res) => {
  // #swagger.tags = ['Contacts']
  // #swagger.summary = 'Get a single contact by id'
  try {
    // Mongo _id values are 24-character hex strings. Check before converting,
    // otherwise ObjectId() throws and we'd return a confusing 500.
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'You must use a valid contact id.' });
    }

    const contactId = new ObjectId(req.params.id);
    const contact = await getDatabase().collection('contacts').findOne({ _id: contactId });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get contact.', error: err.message });
  }
};

// POST /contacts  ->  create a new contact, respond with its new id
const createContact = async (req, res) => {
  // #swagger.tags = ['Contacts']
  // #swagger.summary = 'Create a new contact'
  /*  #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Contact" },
            example: {
              firstName: "Grace",
              lastName: "Hopper",
              email: "grace.hopper@example.com",
              favoriteColor: "navy",
              birthday: "1906-12-09"
            }
          }
        }
      }
  */
  try {
    const missing = findMissingFields(req.body);
    if (missing.length > 0) {
      return res.status(400).json({
        message: 'All fields are required.',
        missingFields: missing
      });
    }

    const contact = buildContact(req.body);
    const result = await getDatabase().collection('contacts').insertOne(contact);

    // 201 Created is the correct code for "I made you a new thing".
    // The assignment asks us to send back the new id.
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create contact.', error: err.message });
  }
};

// PUT /contacts/:id  ->  replace an existing contact
const updateContact = async (req, res) => {
  // #swagger.tags = ['Contacts']
  // #swagger.summary = 'Update a contact by id'
  /*  #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Contact" },
            example: {
              firstName: "Grace",
              lastName: "Hopper",
              email: "grace.hopper@navy.mil",
              favoriteColor: "teal",
              birthday: "1906-12-09"
            }
          }
        }
      }
  */
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'You must use a valid contact id.' });
    }

    const missing = findMissingFields(req.body);
    if (missing.length > 0) {
      return res.status(400).json({
        message: 'All fields are required.',
        missingFields: missing
      });
    }

    const contactId = new ObjectId(req.params.id);
    const contact = buildContact(req.body);

    // $set replaces just these five fields and leaves _id alone.
    const result = await getDatabase()
      .collection('contacts')
      .updateOne({ _id: contactId }, { $set: contact });

    // matchedCount tells us whether that id exists at all. We check this
    // instead of modifiedCount, because re-sending identical data is a
    // successful update even though nothing actually changed.
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    // 204 No Content: it worked, and there is nothing to send back.
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Failed to update contact.', error: err.message });
  }
};

// DELETE /contacts/:id  ->  remove a contact
const deleteContact = async (req, res) => {
  // #swagger.tags = ['Contacts']
  // #swagger.summary = 'Delete a contact by id'
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'You must use a valid contact id.' });
    }

    const contactId = new ObjectId(req.params.id);
    const result = await getDatabase().collection('contacts').deleteOne({ _id: contactId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    res.status(200).json({ message: 'Contact deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete contact.', error: err.message });
  }
};

module.exports = { getAll, getSingle, createContact, updateContact, deleteContact };
