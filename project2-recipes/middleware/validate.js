const { ObjectId } = require('mongodb');

// ---------------------------------------------------------------------------
// A tiny validation helper.
//
// Instead of writing the same if-statements in every controller, each
// collection describes its fields once in a "schema" below. checkAgainstSchema
// walks that schema and collects every problem it finds, so the response can
// tell the client about all the bad fields at once instead of one at a time.
// ---------------------------------------------------------------------------

// Checks one value against one rule. Returns an error string, or null if fine.
const checkField = (value, name, rule) => {
  // Every field in these schemas is required.
  if (value === undefined || value === null || value === '') {
    return `${name} is required.`;
  }

  if (rule.type === 'string') {
    if (typeof value !== 'string') return `${name} must be text.`;
    const trimmed = value.trim();
    if (trimmed.length < rule.min) return `${name} must be at least ${rule.min} characters.`;
    if (trimmed.length > rule.max) return `${name} must be ${rule.max} characters or fewer.`;
    return null;
  }

  if (rule.type === 'email') {
    if (typeof value !== 'string') return `${name} must be text.`;
    // Deliberately simple: something, an @, something, a dot, something.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${name} must be a valid email address.`;
    }
    return null;
  }

  if (rule.type === 'integer') {
    if (!Number.isInteger(value)) return `${name} must be a whole number.`;
    if (value < rule.min) return `${name} must be ${rule.min} or more.`;
    if (value > rule.max) return `${name} must be ${rule.max} or less.`;
    return null;
  }

  if (rule.type === 'enum') {
    if (!rule.values.includes(value)) {
      return `${name} must be one of: ${rule.values.join(', ')}.`;
    }
    return null;
  }

  if (rule.type === 'stringArray') {
    if (!Array.isArray(value)) return `${name} must be a list.`;
    if (value.length < rule.min) return `${name} needs at least ${rule.min} item(s).`;
    const allText = value.every((item) => typeof item === 'string' && item.trim() !== '');
    if (!allText) return `${name} must be a list of non-empty text values.`;
    return null;
  }

  if (rule.type === 'objectId') {
    if (!ObjectId.isValid(value)) return `${name} must be a valid 24-character id.`;
    return null;
  }

  return null;
};

// Runs every rule in a schema and returns an array of error messages.
const checkAgainstSchema = (body, schema) => {
  const errors = [];
  Object.keys(schema).forEach((name) => {
    const problem = checkField(body[name], name, schema[name]);
    if (problem) errors.push(problem);
  });
  return errors;
};

// ---------------------------------------------------------------------------
// The schemas
// ---------------------------------------------------------------------------

const recipeSchema = {
  title:        { type: 'string', min: 2, max: 100 },
  description:  { type: 'string', min: 10, max: 500 },
  cuisine:      { type: 'string', min: 2, max: 50 },
  difficulty:   { type: 'enum', values: ['easy', 'medium', 'hard'] },
  prepMinutes:  { type: 'integer', min: 0, max: 1440 },
  cookMinutes:  { type: 'integer', min: 0, max: 1440 },
  servings:     { type: 'integer', min: 1, max: 100 },
  ingredients:  { type: 'stringArray', min: 1 },
  instructions: { type: 'stringArray', min: 1 },
  chefId:       { type: 'objectId' }
};

const chefSchema = {
  firstName:       { type: 'string', min: 2, max: 50 },
  lastName:        { type: 'string', min: 2, max: 50 },
  email:           { type: 'email' },
  specialty:       { type: 'string', min: 2, max: 60 },
  yearsExperience: { type: 'integer', min: 0, max: 80 },
  bio:             { type: 'string', min: 10, max: 500 }
};

// ---------------------------------------------------------------------------
// The middleware. Express runs these before the controller, so a controller
// never has to wonder whether req.body is trustworthy.
// ---------------------------------------------------------------------------

const validateBody = (schema) => (req, res, next) => {
  const errors = checkAgainstSchema(req.body || {}, schema);

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors
    });
  }

  next();
};

// Checks the :id in the URL before the controller tries to use it.
const validateId = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: ['id must be a valid 24-character id.']
    });
  }
  next();
};

module.exports = {
  validateRecipe: validateBody(recipeSchema),
  validateChef: validateBody(chefSchema),
  validateId,
  recipeSchema,
  chefSchema
};
