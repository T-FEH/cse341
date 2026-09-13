// One-off helper: run `node seed.js` to put starter contacts in the database.
const { initDb, getDatabase } = require('./db/connect');

const contacts = [
  {
    firstName: 'Tife',
    lastName: 'Alewi',
    email: 'alewibolu05@gmail.com',
    favoriteColor: 'blue',
    birthday: '2003-04-12'
  },
  {
    firstName: 'Ada',
    lastName: 'Okonkwo',
    email: 'ada.okonkwo@example.com',
    favoriteColor: 'green',
    birthday: '1999-11-02'
  },
  {
    firstName: 'Marcus',
    lastName: 'Reed',
    email: 'marcus.reed@example.com',
    favoriteColor: 'orange',
    birthday: '2001-06-25'
  },
  {
    firstName: 'Daniel',
    lastName: 'Whitfield',
    email: 'daniel.whitfield@example.com',
    favoriteColor: 'red',
    birthday: '1997-09-14'
  },
  {
    firstName: 'Priya',
    lastName: 'Raman',
    email: 'priya.raman@example.com',
    favoriteColor: 'yellow',
    birthday: '2002-03-08'
  },
  {
    firstName: 'Sofia',
    lastName: 'Martinez',
    email: 'sofia.martinez@example.com',
    favoriteColor: 'purple',
    birthday: '2000-01-30'
  }
];

const run = async () => {
  await initDb();
  const collection = getDatabase().collection('contacts');

  // Start clean so re-running the script doesn't create duplicates.
  await collection.deleteMany({});
  const result = await collection.insertMany(contacts);

  console.log(`Inserted ${result.insertedCount} contacts:`);
  Object.values(result.insertedIds).forEach((id) => console.log('  ' + id));
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
