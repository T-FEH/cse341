// Run `npm run swagger` to regenerate swagger.json after changing routes.
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
  info: {
    title: 'Contacts API',
    description:
      'CSE 341 Contacts API. Stores contacts in MongoDB and exposes them over REST. ' +
      'Every contact has a firstName, lastName, email, favoriteColor and birthday.',
    version: '1.0.0'
  },
  // A relative URL means Swagger sends requests to whatever host is serving
  // the docs. On Render that is the Render URL, on my machine it is localhost,
  // so the same swagger.json works in both places.
  servers: [
    { url: '/', description: 'This server' },
    { url: 'https://cse341-contacts-34w0.onrender.com', description: 'Render (production)' }
  ],
  tags: [
    { name: 'Contacts', description: 'Create, read, update and delete contacts' },
    { name: 'Hello World', description: 'Basic health check route' }
  ],
  components: {
    schemas: {
      Contact: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'favoriteColor', 'birthday'],
        properties: {
          firstName: { type: 'string', example: 'Grace' },
          lastName: { type: 'string', example: 'Hopper' },
          email: { type: 'string', example: 'grace.hopper@example.com' },
          favoriteColor: { type: 'string', example: 'navy' },
          birthday: { type: 'string', example: '1906-12-09' }
        }
      }
    }
  }
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];

swaggerAutogen(outputFile, routes, doc);
