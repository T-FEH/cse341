# CSE341 Project 2 - Recipe Box API

A REST API for recipes and the chefs who write them. Node.js, Express and MongoDB.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your MongoDB connection string.
3. `npm run seed` to load starter data.
4. `npm run dev` to start on http://localhost:3000

## Collections

| Collection | Fields | Count |
|---|---|---|
| `recipes` | title, description, cuisine, difficulty, prepMinutes, cookMinutes, servings, ingredients, instructions, chefId | 10 |
| `chefs` | firstName, lastName, email, specialty, yearsExperience, bio | 6 |

## Endpoints

| Method | Route | Success | Errors |
|---|---|---|---|
| GET | `/` | 200 | - |
| GET | `/recipes` | 200 | 500 |
| GET | `/recipes/:id` | 200 | 400, 404, 500 |
| POST | `/recipes` | 201 + id | 400, 500 |
| PUT | `/recipes/:id` | 204 | 400, 404, 500 |
| DELETE | `/recipes/:id` | 200 | 400, 404, 500 |
| GET | `/chefs` | 200 | 500 |
| GET | `/chefs/:id` | 200 | 400, 404, 500 |
| POST | `/chefs` | 201 + id | 400, 500 |
| PUT | `/chefs/:id` | 204 | 400, 404, 500 |
| DELETE | `/chefs/:id` | 200 | 400, 404, 500 |

## Validation

Every POST and PUT on both collections runs through `middleware/validate.js`
before the controller sees the request. A failure returns `400` and lists
every problem at once:

```json
{
  "message": "Validation failed.",
  "errors": [
    "title must be at least 2 characters.",
    "difficulty must be one of: easy, medium, hard.",
    "servings must be 1 or more."
  ]
}
```

Beyond field rules, the API also rejects:

- a `chefId` that does not match a real chef
- a chef email that another chef already uses
- deleting a chef who still owns recipes

## Error handling

Every controller wraps its database work in try/catch and returns `500` on
failure. `server.js` adds a JSON-parse handler, a 404 handler for unknown
routes, and a global handler as a final safety net.

## Project structure

```
server.js                → setup, mounts routes, global error handling
  routes/index.js        → "/" and mounts the other route files
    routes/swagger.js    → serves the Swagger GUI at /api-docs
    routes/recipes.js    → 5 recipe routes
    routes/chefs.js      → 5 chef routes
      middleware/validate.js   → field rules, runs before controllers
      controllers/recipes.js   → recipe logic
      controllers/chefs.js     → chef logic
        db/connect.js    → one shared MongoDB connection
```

## Live URLs

- API: https://cse341-recipes-nm9i.onrender.com
- Docs: https://cse341-recipes-nm9i.onrender.com/api-docs

## Testing

Use `recipes.rest` with the VS Code REST Client extension, or the interactive
Swagger GUI at `/api-docs`.
