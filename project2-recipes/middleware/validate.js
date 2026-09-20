const { ObjectId } = require('mongodb');

// These run before the controller, so by the time a controller runs
// we already know the data is good.

function validateRecipe(req, res, next) {
  const body = req.body || {};
  const errors = [];

  if (!body.title || body.title.trim().length < 2 || body.title.trim().length > 100) {
    errors.push('title is required and must be 2 to 100 characters.');
  }

  if (!body.description || body.description.trim().length < 10 || body.description.trim().length > 500) {
    errors.push('description is required and must be 10 to 500 characters.');
  }

  if (!body.cuisine || body.cuisine.trim().length < 2 || body.cuisine.trim().length > 50) {
    errors.push('cuisine is required and must be 2 to 50 characters.');
  }

  const levels = ['easy', 'medium', 'hard'];
  if (!levels.includes(body.difficulty)) {
    errors.push('difficulty must be easy, medium or hard.');
  }

  if (!Number.isInteger(body.prepMinutes) || body.prepMinutes < 0 || body.prepMinutes > 1440) {
    errors.push('prepMinutes must be a whole number from 0 to 1440.');
  }

  if (!Number.isInteger(body.cookMinutes) || body.cookMinutes < 0 || body.cookMinutes > 1440) {
    errors.push('cookMinutes must be a whole number from 0 to 1440.');
  }

  if (!Number.isInteger(body.servings) || body.servings < 1 || body.servings > 100) {
    errors.push('servings must be a whole number from 1 to 100.');
  }

  if (!Array.isArray(body.ingredients) || body.ingredients.length < 1) {
    errors.push('ingredients must be a list with at least one item.');
  }

  if (!Array.isArray(body.instructions) || body.instructions.length < 1) {
    errors.push('instructions must be a list with at least one item.');
  }

  if (!body.chefId || !ObjectId.isValid(body.chefId)) {
    errors.push('chefId must be a valid 24 character id.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed.', errors: errors });
  }

  next();
}

function validateChef(req, res, next) {
  const body = req.body || {};
  const errors = [];

  if (!body.firstName || body.firstName.trim().length < 2 || body.firstName.trim().length > 50) {
    errors.push('firstName is required and must be 2 to 50 characters.');
  }

  if (!body.lastName || body.lastName.trim().length < 2 || body.lastName.trim().length > 50) {
    errors.push('lastName is required and must be 2 to 50 characters.');
  }

  // Simple check: something, an @, something, a dot, something.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.email || !emailPattern.test(body.email)) {
    errors.push('email is required and must be a valid email address.');
  }

  if (!body.specialty || body.specialty.trim().length < 2 || body.specialty.trim().length > 60) {
    errors.push('specialty is required and must be 2 to 60 characters.');
  }

  if (!Number.isInteger(body.yearsExperience) || body.yearsExperience < 0 || body.yearsExperience > 80) {
    errors.push('yearsExperience must be a whole number from 0 to 80.');
  }

  if (!body.bio || body.bio.trim().length < 10 || body.bio.trim().length > 500) {
    errors.push('bio is required and must be 10 to 500 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed.', errors: errors });
  }

  next();
}

// Checks the id in the url before the controller uses it
function validateId(req, res, next) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: ['id must be a valid 24 character id.']
    });
  }
  next();
}

module.exports = { validateRecipe, validateChef, validateId };
