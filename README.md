# CSE341 - Contacts API

A REST API for storing and retrieving contacts, built with Node.js, Express and MongoDB.

**Live:** https://cse341-contacts-34w0.onrender.com
**Docs:** https://cse341-contacts-34w0.onrender.com/api-docs

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your MongoDB connection string.
3. `node seed.js` to load starter contacts into the database.
4. `npm run dev` to start the server on http://localhost:3000

## Endpoints

| Method | Route            | Description          | Success |
|--------|------------------|----------------------|---------|
| GET    | `/`              | Hello World          | 200     |
| GET    | `/contacts`      | Get all contacts     | 200     |
| GET    | `/contacts/:id`  | Get a single contact | 200     |
| POST   | `/contacts`      | Create a contact     | 201 + new id |
| PUT    | `/contacts/:id`  | Update a contact     | 204     |
| DELETE | `/contacts/:id`  | Delete a contact     | 200     |

Each contact has: `firstName`, `lastName`, `email`, `favoriteColor`, `birthday`.
All five are required on POST and PUT.

### Errors

| Code | When |
|------|------|
| 400  | Malformed id, or a required field is missing |
| 404  | Valid id that isn't in the database |
| 500  | Database failure |

## Project structure

```
server.js                → starts Express, connects to Mongo, then listens
  routes/index.js        → "/" and mounts the other route files
    routes/swagger.js    → serves the Swagger GUI at /api-docs
    routes/contacts.js   → maps URLs to controller functions
      controllers/contacts.js  → request handling and validation
        db/connect.js    → one shared MongoDB connection
```

## Swagger

`swagger.json` is generated from the `#swagger` comments in the route and
controller files. After changing routes, regenerate it:

```
npm run swagger
```

## Testing

Use `contacts.rest` with the VS Code REST Client extension, or the interactive
Swagger GUI at `/api-docs`.
