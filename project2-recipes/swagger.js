// Run `npm run swagger` to regenerate swagger.json after changing routes.
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
  info: {
    title: 'Recipe Box API',
    description:
      'CSE 341 Project 2. A REST API for recipes and the chefs who wrote them. ' +
      'Two MongoDB collections with full CRUD, field validation on every write, ' +
      'and error handling on every route.',
    version: '1.0.0'
  },
  // A relative url makes Swagger call whatever host is serving the docs
  servers: [
    { url: '/', description: 'This server' }
  ],
  tags: [
    { name: 'Recipes', description: 'Recipes - 10 fields per document' },
    { name: 'Chefs', description: 'The chefs who author recipes' },
    { name: 'Health', description: 'Service health check' }
  ],
  components: {
    schemas: {
      Recipe: {
        type: 'object',
        required: ['title', 'description', 'cuisine', 'difficulty', 'prepMinutes',
                   'cookMinutes', 'servings', 'ingredients', 'instructions', 'chefId'],
        properties: {
          title:        { type: 'string', example: 'Spaghetti Carbonara', description: '2-100 characters' },
          description:  { type: 'string', example: 'A Roman pasta dish built on eggs, cheese and cured pork.', description: '10-500 characters' },
          cuisine:      { type: 'string', example: 'Italian', description: '2-50 characters' },
          difficulty:   { type: 'string', enum: ['easy', 'medium', 'hard'], example: 'medium' },
          prepMinutes:  { type: 'integer', example: 10, description: 'Whole number, 0-1440' },
          cookMinutes:  { type: 'integer', example: 15, description: 'Whole number, 0-1440' },
          servings:     { type: 'integer', example: 4, description: 'Whole number, 1-100' },
          ingredients:  { type: 'array', items: { type: 'string' }, example: ['400g spaghetti', '150g guanciale'], description: 'At least one item' },
          instructions: { type: 'array', items: { type: 'string' }, example: ['Boil the pasta.', 'Toss off the heat.'], description: 'At least one item' },
          chefId:       { type: 'string', example: '6ab02364ab12e572f6ca9fd5', description: 'Must match an existing chef' }
        }
      },
      Chef: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'specialty', 'yearsExperience', 'bio'],
        properties: {
          firstName:       { type: 'string', example: 'Marco', description: '2-50 characters' },
          lastName:        { type: 'string', example: 'Bellini', description: '2-50 characters' },
          email:           { type: 'string', example: 'marco.bellini@example.com', description: 'Must be unique' },
          specialty:       { type: 'string', example: 'Northern Italian', description: '2-60 characters' },
          yearsExperience: { type: 'integer', example: 18, description: 'Whole number, 0-80' },
          bio:             { type: 'string', example: 'Trained in Bologna and spent a decade making fresh pasta by hand.', description: '10-500 characters' }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed.' },
          errors:  { type: 'array', items: { type: 'string' }, example: ['title is required.', 'servings must be 1 or more.'] }
        }
      }
    }
  }
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];

swaggerAutogen(outputFile, routes, doc).then(() => {
  // swagger-autogen cannot set a default value for a path parameter, so we
  // add them here. This is what makes the Try it out boxes come pre-filled.
  const fs = require('fs');
  const spec = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

  const defaultIds = {
    '/recipes/{id}': '000000000000000000000a01',
    '/chefs/{id}': '000000000000000000000c06'
  };

  Object.keys(defaultIds).forEach((path) => {
    Object.keys(spec.paths[path]).forEach((method) => {
      spec.paths[path][method].parameters = [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'The 24 character id of the document',
          schema: { type: 'string', default: defaultIds[path] }
        }
      ];
    });
  });

  fs.writeFileSync(outputFile, JSON.stringify(spec, null, 2));
  console.log('Added default ids to the path parameters');
});
