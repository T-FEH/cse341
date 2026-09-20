// Run `npm run seed` to fill the database with starting data
const { initDb, getDatabase } = require('./db/connect');

const chefs = [
  { firstName: 'Marco', lastName: 'Bellini', email: 'marco.bellini@example.com',
    specialty: 'Northern Italian', yearsExperience: 18,
    bio: 'Trained in Bologna and spent a decade making fresh pasta by hand.' },
  { firstName: 'Amara', lastName: 'Okafor', email: 'amara.okafor@example.com',
    specialty: 'West African', yearsExperience: 12,
    bio: 'Grew up cooking in Lagos and now teaches jollof technique worldwide.' },
  { firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.tanaka@example.com',
    specialty: 'Japanese home cooking', yearsExperience: 9,
    bio: 'Believes a good dashi is the foundation of almost every Japanese dish.' },
  { firstName: 'Sofia', lastName: 'Reyes', email: 'sofia.reyes@example.com',
    specialty: 'Mexican', yearsExperience: 15,
    bio: 'Specialises in slow-cooked moles that take three days to build.' },
  { firstName: 'Tife', lastName: 'Alewi', email: 'tife.alewi@example.com',
    specialty: 'Baking and pastry', yearsExperience: 4,
    bio: 'Learned to bake during university and has not stopped since then.' }
];

// chefIndex points at the chefs list above. The real id gets
// filled in after the chefs are inserted.
const recipes = [
  { chefIndex: 0, title: 'Spaghetti Carbonara', description: 'A Roman pasta dish built on eggs, cheese and cured pork.',
    cuisine: 'Italian', difficulty: 'medium', prepMinutes: 10, cookMinutes: 15, servings: 4,
    ingredients: ['400g spaghetti', '150g guanciale', '4 egg yolks', '80g pecorino romano', 'black pepper'],
    instructions: ['Boil the pasta in salted water.', 'Crisp the guanciale in a dry pan.', 'Whisk yolks with pecorino.', 'Toss everything off the heat so the eggs thicken without scrambling.'] },
  { chefIndex: 0, title: 'Risotto alla Milanese', description: 'A slow-stirred saffron risotto from Milan.',
    cuisine: 'Italian', difficulty: 'hard', prepMinutes: 10, cookMinutes: 30, servings: 4,
    ingredients: ['320g carnaroli rice', '1 pinch saffron', '1L beef stock', '1 onion', '60g butter', '50g parmesan'],
    instructions: ['Soften the onion in butter.', 'Toast the rice until translucent.', 'Add stock one ladle at a time.', 'Stir in saffron, butter and parmesan at the end.'] },
  { chefIndex: 1, title: 'Jollof Rice', description: 'Smoky West African rice simmered in a rich pepper base.',
    cuisine: 'West African', difficulty: 'medium', prepMinutes: 20, cookMinutes: 45, servings: 6,
    ingredients: ['3 cups long grain rice', '6 plum tomatoes', '2 red bell peppers', '1 scotch bonnet', '1 onion', 'thyme', 'curry powder'],
    instructions: ['Blend the tomatoes, peppers and onion.', 'Fry the blend until it darkens.', 'Add rice and stock.', 'Cover and steam until each grain separates.'] },
  { chefIndex: 1, title: 'Suya Skewers', description: 'Grilled beef skewers coated in a spiced peanut rub.',
    cuisine: 'West African', difficulty: 'easy', prepMinutes: 25, cookMinutes: 10, servings: 4,
    ingredients: ['500g beef sirloin', '80g roasted peanuts', '1 tbsp paprika', '1 tsp cayenne', '1 tsp ginger powder', 'vegetable oil'],
    instructions: ['Grind the peanuts and spices into a coarse rub.', 'Thread thin beef strips onto skewers.', 'Coat in oil then the rub.', 'Grill hot and fast, turning once.'] },
  { chefIndex: 2, title: 'Miso Soup', description: 'A simple dashi broth finished with miso paste and tofu.',
    cuisine: 'Japanese', difficulty: 'easy', prepMinutes: 5, cookMinutes: 10, servings: 2,
    ingredients: ['600ml dashi', '2 tbsp miso paste', '150g silken tofu', '2 spring onions', '1 sheet wakame'],
    instructions: ['Warm the dashi without boiling it.', 'Soften the wakame.', 'Whisk the miso into a ladle of broth before adding it back.', 'Add tofu and spring onion off the heat.'] },
  { chefIndex: 2, title: 'Chicken Katsu', description: 'Panko-crusted chicken cutlet fried until deeply golden.',
    cuisine: 'Japanese', difficulty: 'medium', prepMinutes: 15, cookMinutes: 12, servings: 2,
    ingredients: ['2 chicken breasts', '100g panko', '1 egg', '50g flour', 'vegetable oil', 'tonkatsu sauce'],
    instructions: ['Flatten the chicken to an even thickness.', 'Coat in flour, then egg, then panko.', 'Shallow fry until golden on both sides.', 'Rest, then slice into strips.'] },
  { chefIndex: 3, title: 'Chicken Tinga Tacos', description: 'Shredded chicken in a smoky chipotle tomato sauce.',
    cuisine: 'Mexican', difficulty: 'easy', prepMinutes: 15, cookMinutes: 25, servings: 4,
    ingredients: ['500g chicken thighs', '3 chipotles in adobo', '400g tomatoes', '1 onion', '2 garlic cloves', 'corn tortillas'],
    instructions: ['Poach and shred the chicken.', 'Blend chipotles, tomatoes, onion and garlic.', 'Simmer the sauce until thick.', 'Fold the chicken through and serve in warm tortillas.'] },
  { chefIndex: 4, title: 'Brown Butter Chocolate Chip Cookies', description: 'Chewy cookies with nutty depth from browned butter.',
    cuisine: 'American', difficulty: 'easy', prepMinutes: 20, cookMinutes: 12, servings: 24,
    ingredients: ['225g butter', '200g brown sugar', '100g caster sugar', '2 eggs', '300g flour', '200g dark chocolate', '1 tsp salt'],
    instructions: ['Brown the butter and let it cool.', 'Beat with both sugars, then the eggs.', 'Fold in flour, chocolate and salt.', 'Chill the dough an hour before baking.'] }
];

const run = async () => {
  await initDb();
  const db = getDatabase();

  // Clear both collections so running this again does not duplicate anything
  await db.collection('recipes').deleteMany({});
  await db.collection('chefs').deleteMany({});

  const chefResult = await db.collection('chefs').insertMany(chefs);
  const chefIds = Object.values(chefResult.insertedIds);
  console.log('Inserted ' + chefResult.insertedCount + ' chefs');

  // Swap chefIndex for the real id Mongo just made
  const recipesToInsert = [];
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    recipesToInsert.push({
      title: recipe.title,
      description: recipe.description,
      cuisine: recipe.cuisine,
      difficulty: recipe.difficulty,
      prepMinutes: recipe.prepMinutes,
      cookMinutes: recipe.cookMinutes,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      chefId: chefIds[recipe.chefIndex].toString()
    });
  }

  const recipeResult = await db.collection('recipes').insertMany(recipesToInsert);
  console.log('Inserted ' + recipeResult.insertedCount + ' recipes');

  console.log('');
  console.log('Ids you can use for testing:');
  console.log('  chef:   ' + chefIds[0]);
  console.log('  recipe: ' + Object.values(recipeResult.insertedIds)[0]);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
