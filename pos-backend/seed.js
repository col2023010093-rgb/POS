const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./src/models/Product');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pos';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Cleared existing data');

    // ✅ Create Admin User
    const adminUser = await User.create({
      firstName: 'Roland',
      lastName: 'Admin',
      email: 'admin@pos.com',
      password: 'Admin123!',
      phone: '555-0001',
      role: 'admin',
      verified: true
    });
    console.log('✅ Admin user created');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: Admin123!`);
    console.log(`   Role: ${adminUser.role}`);

    // ✅ Create Customer User
    const customerUser = await User.create({
      firstName: 'John',
      lastName: 'Customer',
      email: 'customer@pos.com',
      password: 'Customer123!',
      phone: '555-0002',
      role: 'customer',
      verified: true
    });
    console.log('✅ Customer user created');
    console.log(`   Email: ${customerUser.email}`);
    console.log(`   Password: Customer123!`);
    console.log(`   Role: ${customerUser.role}`);

    // ✅ Create Products
    const products = await Product.create([

      // ─── SOUPS & STARTERS ───────────────────────────────────────────────

      {
        name: 'Corn Tortilla Soup',
        description: 'A Mexican classic with a Texas Joe\'s twist.',
        price: 250,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '10 mins',
        ingredients: ['Corn tortilla', 'Chicken broth', 'Tomatoes', 'Spices']
      },
      {
        name: 'Cream of Mushroom Soup',
        description: 'House made with real cream and mushrooms.',
        price: 250,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '10 mins',
        ingredients: ['Mushrooms', 'Heavy cream', 'Butter', 'Garlic', 'Onion']
      },
      {
        name: 'Seafood Chowder',
        description: 'Salmon, shrimp, potato, carrots, corn, onions & bacon bits.',
        price: 280,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '12 mins',
        ingredients: ['Salmon', 'Shrimp', 'Potato', 'Carrots', 'Corn', 'Onions', 'Bacon bits']
      },
      {
        name: 'Riblets',
        description: 'Tender morsels of spare rib trimmings, served on a bed of Tater Peels.',
        price: 280,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '15 mins',
        ingredients: ['Pork spare rib trimmings', 'House dry rub', 'Hickory smoke', 'Tater peels']
      },
      {
        name: 'Crispy Tater Peels',
        description: 'Fried potato skins served as a tasty snack. Comes with Ranch Dressing.',
        price: 90,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '8 mins',
        ingredients: ['Potato skins', 'Seasoning', 'Ranch dressing']
      },
      {
        name: 'Redneck Egg Rolls',
        description: 'Crispy egg rolls stuffed with smoked pork and slaw. Comes with homemade Ranch dipping sauce.',
        price: 370,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '12 mins',
        ingredients: ['Egg roll wrapper', 'Smoked pork', 'Coleslaw', 'Ranch dipping sauce']
      },
      {
        name: 'Plain Chips',
        description: 'Classic plain tortilla chips.',
        price: 140,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '3 mins',
        ingredients: ['Corn tortilla chips']
      },
      {
        name: 'Chips with Pico de Gallo or Guacamole',
        description: 'Tortilla chips served with your choice of Pico de Gallo or Guacamole.',
        price: 210,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '5 mins',
        ingredients: ['Corn tortilla chips', 'Tomatoes', 'Onion', 'Cilantro', 'Avocado', 'Lime']
      },
      {
        name: 'Chips with Chili-Cheese Dip',
        description: 'Tortilla chips served with a hearty chili-cheese dip.',
        price: 240,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Corn tortilla chips', 'Chili', 'Nacho cheese sauce']
      },
      {
        name: 'Chips with the Works',
        description: 'Tortilla chips served with Pico de Gallo, Guacamole, and Chili-Cheese Dip.',
        price: 360,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Corn tortilla chips', 'Pico de gallo', 'Guacamole', 'Chili-cheese dip']
      },
      {
        name: 'Skewer of Shrimp',
        description: 'Seasoned and grilled shrimp on a stick.',
        price: 310,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '12 mins',
        ingredients: ['Shrimp', 'Seasoning blend', 'Butter', 'Garlic']
      },
      {
        name: 'Panhandle Fries',
        description: 'Imported skin-on fries. Add Jalapeños and Nacho Cheese for Tex-Mex style (+₱130).',
        price: 250,
        category: 'soups & starters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '10 mins',
        ingredients: ['Skin-on fries', 'Seasoning']
      },

      // ─── SALADS, WINGS & MORE ────────────────────────────────────────────

      {
        name: 'Cowpoke Salad (Regular)',
        description: '4 kinds of lettuce tossed with tomatoes, cucumbers, Bermuda onions and cheese. Choice of Italian, Thousand Island or Ranch dressing.',
        price: 250,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '8 mins',
        ingredients: ['Mixed lettuce', 'Tomatoes', 'Cucumbers', 'Bermuda onions', 'Cheese', 'Dressing']
      },
      {
        name: 'Cowpoke Salad (Large)',
        description: '4 kinds of lettuce tossed with tomatoes, cucumbers, Bermuda onions and cheese. Choice of Italian, Thousand Island or Ranch dressing.',
        price: 370,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '8 mins',
        ingredients: ['Mixed lettuce', 'Tomatoes', 'Cucumbers', 'Bermuda onions', 'Cheese', 'Dressing']
      },
      {
        name: 'Buffalo Nuggets (Regular)',
        description: 'Tender boneless chicken breast, brined, rubbed, smoked, battered and fried. Choice of Spicy Buffalo Sauce, Joe\'s Original or Carolina Honey Sauce.',
        price: 360,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '15 mins',
        ingredients: ['Boneless chicken breast', 'Brine', 'House rub', 'Hickory smoke', 'Batter', 'Wing sauce']
      },
      {
        name: 'Buffalo Nuggets (Large)',
        description: 'Tender boneless chicken breast, brined, rubbed, smoked, battered and fried. Choice of Spicy Buffalo Sauce, Joe\'s Original or Carolina Honey Sauce.',
        price: 590,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Boneless chicken breast', 'Brine', 'House rub', 'Hickory smoke', 'Batter', 'Wing sauce']
      },
      {
        name: 'Onion Loaf',
        description: 'Sweet onions, battered and deep fried in a loaf.',
        price: 360,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '12 mins',
        ingredients: ['Sweet onions', 'Batter', 'Seasoning']
      },
      {
        name: 'Ultimate Nachos (Regular)',
        description: 'Corn tortilla chips, smoked chicken, pork or beef, onion, nacho sauce, pico de gallo salsa, sour cream and jalapeño peppers.',
        price: 410,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '12 mins',
        ingredients: ['Corn tortilla chips', 'Smoked meat', 'Onion', 'Nacho sauce', 'Pico de gallo', 'Sour cream', 'Jalapeños']
      },
      {
        name: 'Ultimate Nachos (Large)',
        description: 'Corn tortilla chips, smoked chicken, pork or beef, onion, nacho sauce, pico de gallo salsa, sour cream and jalapeño peppers.',
        price: 620,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '12 mins',
        ingredients: ['Corn tortilla chips', 'Smoked meat', 'Onion', 'Nacho sauce', 'Pico de gallo', 'Sour cream', 'Jalapeños']
      },
      {
        name: 'Road Kill Chili',
        description: 'Our chili is the best. Make a meal out of it.',
        price: 340,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '10 mins',
        ingredients: ['Ground beef', 'Kidney beans', 'Tomatoes', 'Chili spices', 'Onion']
      },
      {
        name: 'Texas Tornado Wings (Regular)',
        description: 'Smoked over real hickory; tossed with your choice of wing sauce and served with homemade Ranch dipping sauce. Choice of Spicy, Joe\'s Original or Carolina Honey.',
        price: 450,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '20 mins',
        ingredients: ['Chicken wings', 'Hickory smoke', 'Wing sauce', 'Ranch dipping sauce']
      },
      {
        name: 'Texas Tornado Wings (Large)',
        description: 'Smoked over real hickory; tossed with your choice of wing sauce and served with homemade Ranch dipping sauce. Choice of Spicy, Joe\'s Original or Carolina Honey.',
        price: 620,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '20 mins',
        ingredients: ['Chicken wings', 'Hickory smoke', 'Wing sauce', 'Ranch dipping sauce']
      },
      {
        name: 'Bacon Pups',
        description: 'Delicious sausage wrapped in crispy bacon. Served on a bed of Tater Peels.',
        price: 310,
        category: 'salads & wings',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '12 mins',
        ingredients: ['Sausage', 'Bacon', 'Tater peels']
      },

    ]);

    console.log(`✅ ${products.length} products seeded`);
    console.log('✅ Seed complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();