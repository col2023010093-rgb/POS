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

      // ─── HICKORY SMOKED SPARE RIBS ───────────────────────────────────────

      {
        name: 'Spare Ribs - Small (2 bone)',
        description: 'USA Swift Premium Pork ribs slow-smoked over hickory wood and char-broiled. Served with homemade BBQ sauces, Roasted Garlic Green Beans and choice of 2 sides.',
        price: 760,
        category: 'spare ribs',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '25 mins',
        ingredients: ['Swift Premium USA pork spare ribs', 'Hickory smoke', 'House BBQ sauce', 'Roasted garlic green beans']
      },
      {
        name: 'Spare Ribs - Medium (3 bone)',
        description: 'USA Swift Premium Pork ribs slow-smoked over hickory wood and char-broiled. Served with homemade BBQ sauces, Roasted Garlic Green Beans and choice of 2 sides.',
        price: 980,
        category: 'spare ribs',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Swift Premium USA pork spare ribs', 'Hickory smoke', 'House BBQ sauce', 'Roasted garlic green beans']
      },
      {
        name: 'Spare Ribs - Large (5 bone)',
        description: 'USA Swift Premium Pork ribs slow-smoked over hickory wood and char-broiled. Served with homemade BBQ sauces, Roasted Garlic Green Beans and choice of 2 sides.',
        price: 1290,
        category: 'spare ribs',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Swift Premium USA pork spare ribs', 'Hickory smoke', 'House BBQ sauce', 'Roasted garlic green beans']
      },
      {
        name: 'Texas Jumbo Rib',
        description: 'A single massive USA Swift Premium Pork spare rib, slow-smoked over hickory and char-broiled. Served with homemade BBQ sauces, Roasted Garlic Green Beans and choice of 2 sides.',
        price: 930,
        category: 'spare ribs',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Swift Premium USA pork spare rib', 'Hickory smoke', 'House BBQ sauce', 'Roasted garlic green beans']
      },
      {
        name: "Joe's Crispy Jumbo Rib",
        description: "A single massive spare rib with Joe's signature crispy finish, slow-smoked over hickory and char-broiled. Served with homemade BBQ sauces, Roasted Garlic Green Beans and choice of 2 sides.",
        price: 930,
        category: 'spare ribs',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Swift Premium USA pork spare rib', 'Hickory smoke', 'Crispy char-broil finish', 'House BBQ sauce', 'Roasted garlic green beans']
      },
      {
        name: 'Humongous Full Slab (12-15 bone)',
        description: 'Texas Family Size platter, good for at least 4 persons. Full slab of USA Swift Premium spare ribs slow-smoked over hickory. Comes with 4 scoops of rice and choice of 4 additional side dishes.',
        price: 3360,
        category: 'spare ribs',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '30 mins',
        ingredients: ['Swift Premium USA full slab pork spare ribs', 'Hickory smoke', 'House BBQ sauce', 'Rice', 'Choice of 4 sides']
      },

      // ─── BABY BACK RIBS ──────────────────────────────────────────────────

      {
        name: 'Baby Back Ribs - Half Rack',
        description: 'Leaner than spare ribs, these come from the loin and are slow-smoked and flame-kissed on the grill. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 1050,
        category: 'baby back ribs',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Pork loin back ribs', 'Hickory smoke', 'House dry rub', 'House BBQ sauce', 'Roasted garlic green beans']
      },
      {
        name: 'Baby Back Ribs - Full Rack',
        description: 'Leaner than spare ribs, these come from the loin and are slow-smoked and flame-kissed on the grill. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 1660,
        category: 'baby back ribs',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Pork loin back ribs', 'Hickory smoke', 'House dry rub', 'House BBQ sauce', 'Roasted garlic green beans']
      },

      // ─── COMBO MEALS ─────────────────────────────────────────────────────

      {
        name: 'Carolina Combo',
        description: 'Swift Premium USA Spare Ribs combined with a quarter of Hickory-Smoked Chicken. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 1060,
        category: 'combo meals',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Swift Premium USA spare ribs', 'Hickory-smoked chicken', 'Hickory smoke', 'House BBQ sauce', 'Roasted garlic green beans']
      },
      {
        name: 'Rib and Shrimp Combo',
        description: 'A skewer of grilled shrimp paired with Swift Premium USA Spare Ribs. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 1060,
        category: 'combo meals',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Swift Premium USA spare ribs', 'Grilled shrimp', 'Seasoning', 'Hickory smoke', 'House BBQ sauce', 'Roasted garlic green beans']
      },
      {
        name: 'Tennessee Trio',
        description: 'Swift Premium USA Spare Ribs, Slow-Smoked Certified Angus Beef Brisket, and a quarter of Hickory-Smoked Chicken. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 1180,
        category: 'combo meals',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '30 mins',
        ingredients: ['Swift Premium USA spare ribs', 'Certified Angus beef brisket', 'Hickory-smoked chicken', 'Hickory smoke', 'House BBQ sauce', 'Roasted garlic green beans']
      },
      {
        name: 'Rib Sampler',
        description: 'A combination of Swift Premium Spare Ribs and Baby Back Ribs. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 1060,
        category: 'combo meals',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Swift Premium USA spare ribs', 'Baby back ribs', 'Hickory smoke', 'House BBQ sauce', 'Roasted garlic green beans']
      },

      // ─── CLASSIC BBQ PLATTERS ────────────────────────────────────────────

      {
        name: 'Chopped Pork Platter',
        description: 'Slow-smoked pork shoulder, chopped, not pulled. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 670,
        category: 'bbq platters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '20 mins',
        ingredients: ['Pork shoulder', 'Hickory smoke', 'House dry rub', 'Roasted garlic green beans']
      },
      {
        name: 'Beef Brisket Platter',
        description: 'Certified Angus Beef (CAB) Brisket, slow-smoked over hickory. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 940,
        category: 'bbq platters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '30 mins',
        ingredients: ['Certified Angus beef brisket', 'Hickory smoke', 'Texas rub', 'Roasted garlic green beans']
      },
      {
        name: 'Texas-Yaki Chicken Breast Platter',
        description: 'Plump chicken breasts, marinated and flame-kissed. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 540,
        category: 'bbq platters',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '20 mins',
        ingredients: ['Chicken breast', 'Teriyaki marinade', 'Seasoning', 'Roasted garlic green beans']
      },
      {
        name: 'Smoked Chicken Platter',
        description: 'Half an oversized chicken, marinated and smoked to perfection. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 670,
        category: 'bbq platters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Half chicken', 'Marinade', 'Hickory smoke', 'Roasted garlic green beans']
      },
      {
        name: 'Texas Style Carnitas',
        description: 'Smoked pork, deep fried, served with 4 flour tortillas and toppings. No sides included.',
        price: 670,
        category: 'bbq platters',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Smoked pork', 'Flour tortillas', 'Pico de gallo', 'Sour cream', 'Jalapeños']
      },
      {
        name: 'Flame Grilled Pork Chops',
        description: 'Two large pork chops, brined then flame grilled. Served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 720,
        category: 'bbq platters',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '20 mins',
        ingredients: ['Pork chops', 'Brine', 'Seasoning', 'Roasted garlic green beans']
      },

      // ─── BBQ SANDWICHES ──────────────────────────────────────────────────

      {
        name: 'Smoked Chicken Sandwich',
        description: 'Hickory-smoked chicken on a toasted bun. Comes with one side of your choice.',
        price: 480,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Smoked chicken', 'Bun', 'Lettuce', 'Tomato', 'House sauce']
      },
      {
        name: 'Smoked Chopped Pork Sandwich',
        description: 'Slow-smoked chopped pork piled high on a toasted bun. Comes with one side of your choice.',
        price: 490,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Chopped smoked pork', 'Bun', 'Coleslaw', 'BBQ sauce']
      },
      {
        name: 'Texas Brisket Hero',
        description: 'Slow-smoked Certified Angus Beef Brisket on a hero roll. Also available with chicken (₱450) or veggie (₱340). Comes with one side of your choice.',
        price: 670,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '20 mins',
        ingredients: ['CAB beef brisket', 'Hero roll', 'Onions', 'Pickles', 'BBQ sauce']
      },
      {
        name: 'Real Steak Sandwich',
        description: 'A hearty steak sandwich packed with flavor. Comes with one side of your choice.',
        price: 1060,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '20 mins',
        ingredients: ['Steak', 'Bread roll', 'Onions', 'Peppers', 'House sauce']
      },
      {
        name: 'Beef Brisket Sandwich',
        description: 'Certified Angus Beef Brisket on a toasted bun. Comes with one side of your choice.',
        price: 550,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '15 mins',
        ingredients: ['CAB beef brisket', 'Bun', 'Pickles', 'BBQ sauce']
      },
      {
        name: 'Grilled Sausage Sandwich',
        description: 'Juicy grilled sausage on a toasted bun. Comes with one side of your choice.',
        price: 540,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Grilled sausage', 'Bun', 'Mustard', 'Onions', 'Peppers']
      },
      {
        name: 'Bubba Burger (Regular)',
        description: 'Classic beef burger, Texas Joe\'s style. Comes with one side of your choice.',
        price: 500,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '15 mins',
        ingredients: ['Beef patty', 'Bun', 'Lettuce', 'Tomato', 'Onion', 'House sauce']
      },
      {
        name: 'Bubba Burger (Double)',
        description: 'Double beef patty burger, Texas Joe\'s style. Comes with one side of your choice.',
        price: 780,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Double beef patty', 'Bun', 'Lettuce', 'Tomato', 'Onion', 'House sauce']
      },
      {
        name: 'Ultimate Bubba (Regular)',
        description: 'The fully loaded Bubba Burger with all the works. Comes with one side of your choice.',
        price: 600,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '15 mins',
        ingredients: ['Beef patty', 'Bacon', 'Cheese', 'Bun', 'Lettuce', 'Tomato', 'Onion', 'House sauce']
      },
      {
        name: 'Ultimate Bubba (Double)',
        description: 'The fully loaded double Bubba Burger with all the works. Comes with one side of your choice.',
        price: 870,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Double beef patty', 'Bacon', 'Cheese', 'Bun', 'Lettuce', 'Tomato', 'Onion', 'House sauce']
      },
      {
        name: 'Tacos',
        description: 'Choice of chicken, pork, or beef. Comes with one side of your choice.',
        price: 250,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '12 mins',
        ingredients: ['Flour tortillas', 'Choice of smoked meat', 'Pico de gallo', 'Sour cream', 'Jalapeños']
      },
      {
        name: "TJ's Grilled Chicken Breast Sandwich",
        description: 'Flame-grilled chicken breast on a toasted bun. Comes with one side of your choice.',
        price: 480,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Grilled chicken breast', 'Bun', 'Lettuce', 'Tomato', 'House sauce']
      },
      {
        name: 'Smoked Chicken Salad Sandwich',
        description: 'Creamy smoked chicken salad on bread. Comes with one side of your choice.',
        price: 460,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '10 mins',
        ingredients: ['Smoked chicken', 'Mayo', 'Celery', 'Onion', 'Bread']
      },
      {
        name: 'Brisket Burger',
        description: 'A premium burger made with slow-smoked Certified Angus Beef Brisket. Comes with one side of your choice.',
        price: 940,
        category: 'sandwiches',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '20 mins',
        ingredients: ['CAB beef brisket', 'Brioche bun', 'Cheese', 'Onion', 'Pickles', 'House sauce']
      },

      // ─── NOT SO HUNGRY / LIGHTER MEALS ──────────────────────────────────

      {
        name: 'Baby Back Rib Lunch',
        description: 'A lighter portion of slow-smoked Baby Back Ribs, perfect for lunch.',
        price: 680,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '20 mins',
        ingredients: ['Baby back ribs', 'Hickory smoke', 'House dry rub', 'BBQ sauce']
      },
      {
        name: 'Barbecue Quesadilla',
        description: 'Choice of beef, chicken, pork, or Road Kill Chili filling in a crispy flour tortilla quesadilla.',
        price: 500,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '12 mins',
        ingredients: ['Flour tortilla', 'Choice of smoked meat or chili', 'Cheese', 'Sour cream', 'Pico de gallo']
      },
      {
        name: 'Texas-Yaki Salad',
        description: 'Fresh salad topped with Texas-Yaki marinated and flame-kissed chicken.',
        price: 500,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '10 mins',
        ingredients: ['Mixed greens', 'Teriyaki chicken', 'Tomatoes', 'Cucumbers', 'Dressing']
      },
      {
        name: 'Burrito Platter',
        description: 'A hearty Texas BBQ-style burrito platter.',
        price: 550,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Flour tortilla', 'Smoked meat', 'Rice', 'Beans', 'Cheese', 'Sour cream', 'Pico de gallo']
      },
      {
        name: 'Panini Chicken Wrap',
        description: 'Grilled panini-style chicken wrap.',
        price: 550,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '12 mins',
        ingredients: ['Grilled chicken', 'Wrap', 'Lettuce', 'Tomato', 'House sauce']
      },
      {
        name: 'Flame Grilled Salmon Platter',
        description: 'Fresh salmon fillet, flame grilled to perfection.',
        price: 1120,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '20 mins',
        ingredients: ['Salmon fillet', 'Seasoning', 'Lemon', 'Butter', 'Roasted garlic green beans']
      },
      {
        name: "Joe's BBQ Salad",
        description: 'Fresh salad topped with your choice of BBQ smoked meats.',
        price: 540,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '10 mins',
        ingredients: ['Mixed greens', 'Smoked meat', 'Tomatoes', 'Cucumbers', 'Onion', 'Dressing']
      },
      {
        name: 'Taco Salad',
        description: 'A Tex-Mex style salad served in a crispy tortilla bowl.',
        price: 500,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '10 mins',
        ingredients: ['Tortilla bowl', 'Mixed greens', 'Smoked meat', 'Cheese', 'Pico de gallo', 'Sour cream']
      },
      {
        name: 'Shrimp Platter',
        description: 'Seasoned and grilled shrimp served as a platter with sides.',
        price: 740,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Shrimp', 'Seasoning', 'Butter', 'Garlic', 'Roasted garlic green beans']
      },
      {
        name: 'Brisket Salad',
        description: 'Fresh salad topped with slices of slow-smoked Certified Angus Beef Brisket.',
        price: 620,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '10 mins',
        ingredients: ['CAB beef brisket', 'Mixed greens', 'Tomatoes', 'Onion', 'Dressing']
      },
      {
        name: 'Shrimp Salad',
        description: 'Fresh salad topped with seasoned grilled shrimp.',
        price: 670,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '10 mins',
        ingredients: ['Grilled shrimp', 'Mixed greens', 'Tomatoes', 'Cucumbers', 'Dressing']
      },
      {
        name: "Mom's Meat Loaf",
        description: 'Classic homestyle meat loaf, Texas Joe\'s way.',
        price: 480,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '15 mins',
        ingredients: ['Ground beef', 'Breadcrumbs', 'Egg', 'Onion', 'House glaze']
      },
      {
        name: 'Pot Roast Beef',
        description: 'Slow-cooked pot roast beef, tender and full of flavor.',
        price: 730,
        category: 'lighter meals',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '20 mins',
        ingredients: ['Beef chuck', 'Carrots', 'Potatoes', 'Onion', 'Beef broth', 'Herbs']
      },

      // ─── STEAKS ──────────────────────────────────────────────────────────

      {
        name: 'Texas T-Bone',
        description: 'One pound T-Bone steak, served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 2090,
        category: 'steaks',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['1 lb T-Bone steak', 'Seasoning', 'Butter', 'Roasted garlic green beans']
      },
      {
        name: 'Filet Mignon',
        description: '9-ounce bacon-wrapped Filet Mignon, served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 1790,
        category: 'steaks',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['9 oz filet mignon', 'Bacon wrap', 'Seasoning', 'Butter', 'Roasted garlic green beans']
      },
      {
        name: 'New York Striploin',
        description: '12-ounce New York Striploin steak, served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 1980,
        category: 'steaks',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['12 oz NY striploin', 'Seasoning', 'Butter', 'Roasted garlic green beans']
      },
      {
        name: 'Rib-Eye Steak',
        description: '12-ounce Rib-Eye steak, served with Roasted Garlic Green Beans and choice of 2 sides.',
        price: 2080,
        category: 'steaks',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['12 oz rib-eye steak', 'Seasoning', 'Butter', 'Roasted garlic green beans']
      },

      // ─── SIDES ───────────────────────────────────────────────────────────

      {
        name: 'Steamed Rice',
        description: 'Fluffy steamed white rice.',
        price: 90,
        category: 'sides',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '5 mins',
        ingredients: ['White rice']
      },
      {
        name: "Joe's Baked Beans",
        description: 'Sweet and smoky baked beans, Texas Joe\'s style.',
        price: 130,
        category: 'sides',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Navy beans', 'Brown sugar', 'Molasses', 'Smoked pork', 'Tomato sauce']
      },
      {
        name: 'Garlic Mashed Potatoes',
        description: 'Creamy mashed potatoes with roasted garlic.',
        price: 120,
        category: 'sides',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Potatoes', 'Roasted garlic', 'Butter', 'Cream', 'Salt']
      },
      {
        name: 'Mac Salad',
        description: 'Classic creamy macaroni salad.',
        price: 90,
        category: 'sides',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '5 mins',
        ingredients: ['Elbow macaroni', 'Mayo', 'Celery', 'Onion', 'Seasoning']
      },
      {
        name: 'Potato Salad',
        description: 'Classic creamy potato salad.',
        price: 100,
        category: 'sides',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '5 mins',
        ingredients: ['Potatoes', 'Mayo', 'Celery', 'Onion', 'Mustard', 'Seasoning']
      },
      {
        name: 'Corny Corn Bread Loaf',
        description: 'House-baked sweet corn bread loaf.',
        price: 150,
        category: 'sides',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Cornmeal', 'Flour', 'Sugar', 'Butter', 'Eggs', 'Buttermilk']
      },

      // ─── DESSERTS ────────────────────────────────────────────────────────

      {
        name: 'Apple Pie',
        description: 'Classic homestyle apple pie.',
        price: 350,
        category: 'desserts',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Apples', 'Cinnamon', 'Sugar', 'Butter', 'Pie crust']
      },
      {
        name: 'Pumpkin Pie',
        description: 'Classic Southern pumpkin pie.',
        price: 310,
        category: 'desserts',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '5 mins',
        ingredients: ['Pumpkin puree', 'Cinnamon', 'Nutmeg', 'Sugar', 'Pie crust']
      },
      {
        name: 'New York Gourmet Cheesecake',
        description: 'Rich and creamy New York style cheesecake.',
        price: 370,
        category: 'desserts',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Cream cheese', 'Sugar', 'Eggs', 'Vanilla', 'Graham cracker crust']
      },
      {
        name: 'Brownie Sundae',
        description: 'Warm fudgy brownie topped with ice cream.',
        price: 310,
        category: 'desserts',
        image: '',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Chocolate brownie', 'Vanilla ice cream', 'Chocolate sauce', 'Whipped cream']
      },
      {
        name: 'Carrot Cake',
        description: 'Moist carrot cake with cream cheese frosting.',
        price: 350,
        category: 'desserts',
        image: '',
        inStock: true,
        popular: false,
        prepTime: '5 mins',
        ingredients: ['Carrots', 'Flour', 'Cinnamon', 'Eggs', 'Cream cheese frosting']
      },

      // ─── KIDS MENU ───────────────────────────────────────────────────────

      {
        name: 'Kids Cheese Quesadilla',
        description: 'Cheesy quesadilla from the Little Joe\'s menu. Includes one fountain drink, fries, and cookies.',
        price: 340,
        category: "kids' menu",
        image: '',
        inStock: true,
        popular: false,
        prepTime: '10 mins',
        ingredients: ['Flour tortilla', 'Cheese', 'Fries', 'Cookies', 'Fountain drink']
      },
      {
        name: 'Kids Chicken Nuggets',
        description: 'Tender chicken nuggets from the Little Joe\'s menu. Includes one fountain drink, fries, and cookies.',
        price: 420,
        category: "kids' menu",
        image: '',
        inStock: true,
        popular: true,
        prepTime: '10 mins',
        ingredients: ['Chicken nuggets', 'Dipping sauce', 'Fries', 'Cookies', 'Fountain drink']
      },
      {
        name: 'Junior Bubba Burger',
        description: 'A smaller Bubba Burger just for the little ones. Includes one fountain drink, fries, and cookies.',
        price: 420,
        category: "kids' menu",
        image: '',
        inStock: true,
        popular: true,
        prepTime: '12 mins',
        ingredients: ['Beef patty', 'Bun', 'Ketchup', 'Fries', 'Cookies', 'Fountain drink']
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