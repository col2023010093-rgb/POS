const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcrypt');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const Reservation = require('./src/models/Reservation');

const seedProducts = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato, mozzarella, and basil',
    price: 350.00,  // ← CHANGED from 1350.00
    category: 'Pizza',
    image: 'pizza1.jpg',
    popular: true,
    ingredients: ['Tomato', 'Mozzarella', 'Basil'],
    prepTime: '15 mins',
    inStock: true
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine with parmesan and croutons',
    price: 180.00,  // ₱180
    category: 'Salad',
    image: 'salad1.jpg',
    popular: false,
    ingredients: ['Romaine', 'Parmesan', 'Croutons'],
    prepTime: '5 mins',
    inStock: true
  },
  {
    name: 'Spaghetti Carbonara',
    description: 'Creamy pasta with bacon and parmesan',
    price: 280.00,  // ₱280
    category: 'Pasta',
    image: 'pasta1.jpg',
    popular: true,
    ingredients: ['Pasta', 'Bacon', 'Cream', 'Parmesan'],
    prepTime: '12 mins',
    inStock: true
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh grilled salmon with lemon butter sauce',
    price: 520.00,  // ₱520
    category: 'Seafood',
    image: 'salmon1.jpg',
    popular: true,
    ingredients: ['Salmon', 'Butter', 'Lemon', 'Herbs'],
    prepTime: '20 mins',
    inStock: true
  },
  {
    name: 'Chicken Parmesan',
    description: 'Breaded chicken with marinara and mozzarella',
    price: 320.00,  // ₱320
    category: 'Chicken',
    image: 'chicken1.jpg',
    popular: false,
    ingredients: ['Chicken', 'Breadcrumbs', 'Marinara', 'Mozzarella'],
    prepTime: '18 mins',
    inStock: true
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with frosting',
    price: 150.00,  // ₱150
    category: 'Dessert',
    image: 'cake1.jpg',
    popular: true,
    ingredients: ['Flour', 'Chocolate', 'Eggs', 'Sugar'],
    prepTime: '5 mins',
    inStock: true
  }
];

const seedUsers = [
  {
    firstName: 'Roland',
    lastName: 'Admin',
    email: 'rolandadmin@gmail.com',  // ← Gmail
    password: 'Password123!',
    phone: '09000000000',
    role: 'admin'
  },
  {
    firstName: 'Jane',
    lastName: 'Customer',
    email: 'janecustomer@gmail.com',  // ← Gmail
    password: 'Password123!',
    phone: '09111111111',
    role: 'user'
  }
];

const seedReservations = [
  {
    firstName: 'Jane',
    lastName: 'Customer',
    email: 'janecustomer@gmail.com',  // ← Changed from jane@pos.com
    phone: '09111111111',
    date: new Date(),
    time: '18:30',
    guests: 2,
    occasion: 'Anniversary',
    seatingPreference: 'Window',
    specialRequests: 'No peanuts',
    status: 'confirmed'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ALWAYS clear and reseed (for development)
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await Reservation.deleteMany({});
    
    const products = await Product.insertMany(seedProducts);
    console.log('✅ Products seeded');

    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => {
        const hashed = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashed };
      })
    );
    const users = await User.insertMany(hashedUsers);
    console.log('✅ Users seeded');

    await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      items: [
        {
          productId: products[0]._id,
          name: products[0].name,
          quantity: 2,
          price: products[0].price
        }
      ],
      customerId: users[1]._id,
      totalAmount: products[0].price * 2,
      status: 'pending',
      paymentMethod: 'cash'
    });
    console.log('✅ Sample order created');

    await Reservation.insertMany(seedReservations);
    console.log('✅ Reservations seeded');

    console.log('✅ Seed complete');
    console.log(`Admin login: rolandadmin@gmail.com / Password123!`);
    console.log(`Customer login: janecustomer@gmail.com / Password123!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();