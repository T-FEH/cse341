# CSE341 - Contacts API

A REST API for storing and retrieving contacts, built with Node.js, Express and MongoDB.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your MongoDB connection string.
3. `node seed.js` to load starter contacts into the database.
4. `npm run dev` to start the server on http://localhost:3000

## Endpoints

| Method | Route            | Description             |
|--------|------------------|-------------------------|
| GET    | `/`              | Hello World             |
| GET    | `/contacts`      | Get all contacts        |
| GET    | `/contacts/:id`  | Get a single contact    |

Each contact has: `firstName`, `lastName`, `email`, `favoriteColor`, `birthday`.

Use `contacts.rest` with the VS Code REST Client extension to test.

## Live URL

https://cse341-contacts-34w0.onrender.com
