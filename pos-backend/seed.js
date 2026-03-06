const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
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

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Cleared existing data');

    // ✅ Create Admin User (VERIFIED)
    const adminUser = await User.create({
      firstName: 'Roland',
      lastName: 'Admin',
      email: 'admin@pos.com',
      password: 'Admin123!',
      phone: '555-0001',
      role: 'admin',
      verified: true  // ✅ Mark as verified
    });
    console.log('✅ Admin user created');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: Admin123!`);
    console.log(`   Role: ${adminUser.role}`);

    // ✅ Create Customer User (VERIFIED)
    const customerUser = await User.create({
      firstName: 'John',
      lastName: 'Customer',
      email: 'customer@pos.com',
      password: 'Customer123!',
      phone: '555-0002',
      role: 'customer',
      verified: true  // ✅ Mark as verified
    });
    console.log('✅ Customer user created');
    console.log(`   Email: ${customerUser.email}`);
    console.log(`   Password: Customer123!`);
    console.log(`   Role: ${customerUser.role}`);

    // ✅ Create Products
    const products = await Product.create([
      {
        name: 'Baby Back Ribs',
        description: 'Slow-smoked for 6 hours with our secret dry rub, served with your choice of two sides',
        price: 24.99,
        category: 'ribs',
        image: '/images/products/baby-back-ribs.jpg',
        inStock: true,
        popular: true,
        prepTime: '25 mins',
        ingredients: ['Pork ribs', 'House dry rub', 'Hickory smoke', 'BBQ glaze']
      },
      {
        name: 'Texas Brisket',
        description: 'Hand-rubbed and smoked over oak wood for 12 hours until perfectly tender',
        price: 26.99,
        category: 'brisket',
        image: '/images/products/texas-brisket.jpg',
        inStock: true,
        popular: true,
        prepTime: '30 mins',
        ingredients: ['Prime beef brisket', 'Texas rub', 'Oak wood smoke', 'Black pepper']
      },
      {
        name: 'Smoked Chicken',
        description: 'Whole chicken smoked to perfection with herbs and citrus',
        price: 16.99,
        category: 'chicken',
        image: '/images/products/smoked-chicken.jpg',
        inStock: true,
        popular: true,
        prepTime: '20 mins',
        ingredients: ['Whole chicken', 'Herb blend', 'Citrus', 'Butter']
      },
      {
        name: 'Pulled Pork',
        description: 'Slow-smoked pork shoulder pulled and served with tangy vinegar sauce',
        price: 14.99,
        category: 'pork',
        image: '/images/products/pulled-pork.jpg',
        inStock: true,
        popular: true,
        prepTime: '15 mins',
        ingredients: ['Pork shoulder', 'Vinegar sauce', 'House rub']
      },
      {
        name: 'Pulled Pork Sandwich',
        description: 'Heaping pulled pork on a brioche bun with slaw',
        price: 12.99,
        category: 'pork',
        image: '/images/products/pork-sandwich.jpg',
        inStock: true,
        popular: true,
        prepTime: '10 mins',
        ingredients: ['Pulled pork', 'Brioche bun', 'Coleslaw', 'Pickles']
      },
      {
        name: 'Coleslaw',
        description: 'Creamy homemade coleslaw with a hint of apple cider vinegar',
        price: 4.99,
        category: 'sides',
        image: '/images/products/coleslaw.jpg',
        inStock: true,
        popular: false,
        prepTime: '5 mins',
        ingredients: ['Cabbage', 'Carrots', 'Mayo', 'Apple cider vinegar']
      },
      {
        name: 'Baked Beans',
        description: 'Sweet and smoky baked beans with burnt ends',
        price: 4.99,
        category: 'sides',
        image: '/images/products/baked-beans.jpg',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Navy beans', 'Burnt ends', 'Brown sugar', 'Molasses']
      },
      {
        name: 'Mac & Cheese',
        description: 'Creamy three-cheese mac with a crispy breadcrumb topping',
        price: 5.99,
        category: 'sides',
        image: '/images/products/mac-cheese.jpg',
        inStock: true,
        popular: true,
        prepTime: '8 mins',
        ingredients: ['Elbow pasta', 'Cheddar', 'Gruyere', 'Parmesan', 'Breadcrumbs']
      },
      {
        name: 'Sweet Tea',
        description: 'Classic Southern sweet tea brewed fresh daily',
        price: 2.99,
        category: 'drinks',
        image: '/images/products/sweet-tea.jpg',
        inStock: true,
        popular: true,
        prepTime: '2 mins',
        ingredients: ['Black tea', 'Cane sugar', 'Lemon']
      },
      {
        name: 'Lemonade',
        description: 'Fresh-squeezed lemonade with a hint of mint',
        price: 3.49,
        category: 'drinks',
        image: '/images/products/lemonade.jpg',
        inStock: true,
        popular: false,
        prepTime: '3 mins',
        ingredients: ['Fresh lemons', 'Cane sugar', 'Mint', 'Sparkling water']
      },
      {
        name: 'Pecan Pie',
        description: 'Traditional Southern pecan pie with whipped cream',
        price: 6.99,
        category: 'desserts',
        image: '/images/products/pecan-pie.jpg',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Pecans', 'Brown sugar', 'Butter', 'Pie crust']
      },
      {
        name: 'Banana Pudding',
        description: 'Creamy vanilla pudding with fresh bananas and wafers',
        price: 5.99,
        category: 'desserts',
        image: '/images/products/banana-pudding.jpg',
        inStock: true,
        popular: true,
        prepTime: '5 mins',
        ingredients: ['Vanilla pudding', 'Bananas', 'Vanilla wafers', 'Whipped cream']
      }
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