const { ObjectId } = require('mongodb');
const { getDatabase } = require('../db/connect');

// GET /contacts  ->  return every contact in the collection
const getAll = async (req, res) => {
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

module.exports = { getAll, getSingle };
