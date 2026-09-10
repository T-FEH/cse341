const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts');

router.get('/', contactsController.getAll);        // GET /contacts
router.get('/:id', contactsController.getSingle);  // GET /contacts/68f...

module.exports = router;
