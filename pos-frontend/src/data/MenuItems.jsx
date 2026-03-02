export const categories = [
  { id: 'all', name: 'All Items', icon: '🍽️' },
  { id: 'ribs', name: 'Ribs', icon: '🍖' },
  { id: 'brisket', name: 'Brisket', icon: '🥩' },
  { id: 'chicken', name: 'Chicken', icon: '🍗' },
  { id: 'pork', name: 'Pork', icon: '🥓' },
  { id: 'sides', name: 'Sides', icon: '🥗' },
  { id: 'drinks', name: 'Drinks', icon: '🥤' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' }
]

export const menuItems = [
  // Ribs
  { 
    id: 1, 
    name: 'Baby Back Ribs', 
    description: 'Slow-smoked for 6 hours with our secret dry rub, served with your choice of two sides', 
    price: 24.99, 
    category: 'ribs', 
    image: '🍖', 
    popular: true,
    ingredients: ['Pork ribs', 'House dry rub', 'Hickory smoke', 'BBQ glaze'],
    tags: ['Best Seller', 'Gluten Free'],
    calories: 850,
    prepTime: '25 min',
    spicyLevel: 0
  },
  { 
    id: 2, 
    name: 'St. Louis Ribs', 
    description: 'Meaty spare ribs with tangy BBQ glaze, fall-off-the-bone tender', 
    price: 22.99, 
    category: 'ribs', 
    image: '🍖', 
    popular: false,
    ingredients: ['Spare ribs', 'Tangy BBQ sauce', 'Brown sugar', 'Spices'],
    tags: ['Chef Special'],
    calories: 920,
    prepTime: '25 min',
    spicyLevel: 0
  },
  { 
    id: 3, 
    name: 'Rib Tips', 
    description: 'Tender rib tips with smoky flavor, perfect for sharing', 
    price: 18.99, 
    category: 'ribs', 
    image: '🍖', 
    popular: false,
    ingredients: ['Rib tips', 'Smoky seasoning', 'BBQ sauce'],
    tags: ['Shareable'],
    calories: 680,
    prepTime: '20 min',
    spicyLevel: 0
  },
  { 
    id: 4, 
    name: 'Spicy Devil Ribs', 
    description: 'Fiery ribs with Carolina Reaper glaze for heat lovers', 
    price: 26.99, 
    category: 'ribs', 
    image: '🍖', 
    popular: true,
    ingredients: ['Pork ribs', 'Carolina Reaper', 'Habanero', 'Ghost pepper'],
    tags: ['Spicy', 'Challenge'],
    calories: 870,
    prepTime: '25 min',
    spicyLevel: 3
  },

  // Brisket
  { 
    id: 5, 
    name: 'Texas Brisket', 
    description: 'Hand-rubbed and smoked over oak wood for 12 hours until perfectly tender', 
    price: 26.99, 
    category: 'brisket', 
    image: '🥩', 
    popular: true,
    ingredients: ['Prime beef brisket', 'Texas rub', 'Oak wood smoke', 'Black pepper'],
    tags: ['Best Seller', 'Signature'],
    calories: 780,
    prepTime: '30 min',
    spicyLevel: 0
  },
  { 
    id: 6, 
    name: 'Sliced Brisket Plate', 
    description: 'Tender sliced brisket with two sides of your choice', 
    price: 19.99, 
    category: 'brisket', 
    image: '🥩', 
    popular: false,
    ingredients: ['Sliced brisket', 'House seasoning', 'Natural jus'],
    tags: ['Value Pick'],
    calories: 650,
    prepTime: '15 min',
    spicyLevel: 0
  },
  { 
    id: 7, 
    name: 'Chopped Brisket Sandwich', 
    description: 'Chopped brisket on a toasted brioche bun with pickles and onions', 
    price: 14.99, 
    category: 'brisket', 
    image: '🥩', 
    popular: true,
    ingredients: ['Chopped brisket', 'Brioche bun', 'Pickles', 'Onions', 'BBQ sauce'],
    tags: ['Fan Favorite'],
    calories: 720,
    prepTime: '12 min',
    spicyLevel: 0
  },
  { 
    id: 8, 
    name: 'Burnt Ends', 
    description: 'Caramelized brisket point cubes, candy-like bark with smoky sweetness', 
    price: 28.99, 
    category: 'brisket', 
    image: '🥩', 
    popular: true,
    ingredients: ['Brisket point', 'Brown sugar glaze', 'KC-style sauce'],
    tags: ['Premium', 'Limited'],
    calories: 890,
    prepTime: '20 min',
    spicyLevel: 0
  },

  // Chicken
  { 
    id: 9, 
    name: 'Smoked Chicken', 
    description: 'Whole chicken smoked to perfection with herbs and citrus', 
    price: 16.99, 
    category: 'chicken', 
    image: '🍗', 
    popular: true,
    ingredients: ['Whole chicken', 'Herb blend', 'Citrus', 'Butter'],
    tags: ['Healthy Choice', 'Gluten Free'],
    calories: 480,
    prepTime: '20 min',
    spicyLevel: 0
  },
  { 
    id: 10, 
    name: 'Chicken Wings', 
    description: 'Crispy smoked wings with your choice of sauce', 
    price: 12.99, 
    category: 'chicken', 
    image: '🍗', 
    popular: false,
    ingredients: ['Chicken wings', 'House seasoning', 'Choice of sauce'],
    tags: ['Spicy Option Available'],
    calories: 560,
    prepTime: '18 min',
    spicyLevel: 1
  },
  { 
    id: 11, 
    name: 'Pulled Chicken', 
    description: 'Tender pulled chicken with tangy Alabama white sauce', 
    price: 13.99, 
    category: 'chicken', 
    image: '🍗', 
    popular: false,
    ingredients: ['Pulled chicken', 'Alabama white sauce', 'Coleslaw'],
    tags: ['Light Option'],
    calories: 420,
    prepTime: '15 min',
    spicyLevel: 0
  },
  { 
    id: 12, 
    name: 'Nashville Hot Chicken', 
    description: 'Crispy fried chicken with fiery cayenne oil and pickles', 
    price: 15.99, 
    category: 'chicken', 
    image: '🍗', 
    popular: true,
    ingredients: ['Chicken breast', 'Cayenne oil', 'Pickles', 'White bread'],
    tags: ['Spicy', 'Trending'],
    calories: 680,
    prepTime: '15 min',
    spicyLevel: 2
  },

  // Pork
  { 
    id: 13, 
    name: 'Pulled Pork', 
    description: 'Slow-smoked pork shoulder pulled and served with tangy vinegar sauce', 
    price: 14.99, 
    category: 'pork', 
    image: '🥓', 
    popular: true,
    ingredients: ['Pork shoulder', 'Vinegar sauce', 'House rub'],
    tags: ['Classic', 'Gluten Free'],
    calories: 520,
    prepTime: '15 min',
    spicyLevel: 0
  },
  { 
    id: 14, 
    name: 'Smoked Pork Chop', 
    description: 'Thick-cut bone-in pork chop with apple butter glaze', 
    price: 18.99, 
    category: 'pork', 
    image: '🥓', 
    popular: false,
    ingredients: ['Bone-in pork chop', 'Apple butter', 'Cinnamon'],
    tags: ['Premium Cut'],
    calories: 620,
    prepTime: '20 min',
    spicyLevel: 0
  },
  { 
    id: 15, 
    name: 'Pulled Pork Sandwich', 
    description: 'Heaping pulled pork on a brioche bun with slaw', 
    price: 12.99, 
    category: 'pork', 
    image: '🥓', 
    popular: true,
    ingredients: ['Pulled pork', 'Brioche bun', 'Coleslaw', 'Pickles'],
    tags: ['Best Value'],
    calories: 580,
    prepTime: '10 min',
    spicyLevel: 0
  },

  // Sides
  { 
    id: 16, 
    name: 'Coleslaw', 
    description: 'Creamy homemade coleslaw with a hint of apple cider vinegar', 
    price: 4.99, 
    category: 'sides', 
    image: '🥗', 
    popular: false,
    ingredients: ['Cabbage', 'Carrots', 'Mayo', 'Apple cider vinegar'],
    tags: ['Vegetarian'],
    calories: 180,
    prepTime: '5 min',
    spicyLevel: 0
  },
  { 
    id: 17, 
    name: 'Baked Beans', 
    description: 'Sweet and smoky baked beans with burnt ends', 
    price: 4.99, 
    category: 'sides', 
    image: '🫘', 
    popular: true,
    ingredients: ['Navy beans', 'Burnt ends', 'Brown sugar', 'Molasses'],
    tags: ['House Favorite'],
    calories: 320,
    prepTime: '5 min',
    spicyLevel: 0
  },
  { 
    id: 18, 
    name: 'Mac & Cheese', 
    description: 'Creamy three-cheese mac with a crispy breadcrumb topping', 
    price: 5.99, 
    category: 'sides', 
    image: '🧀', 
    popular: true,
    ingredients: ['Elbow pasta', 'Cheddar', 'Gruyere', 'Parmesan', 'Breadcrumbs'],
    tags: ['Vegetarian', 'Kids Love It'],
    calories: 450,
    prepTime: '8 min',
    spicyLevel: 0
  },
  { 
    id: 19, 
    name: 'Cornbread', 
    description: 'Sweet buttery cornbread with honey butter', 
    price: 3.99, 
    category: 'sides', 
    image: '🍞', 
    popular: false,
    ingredients: ['Cornmeal', 'Butter', 'Honey', 'Buttermilk'],
    tags: ['Vegetarian'],
    calories: 280,
    prepTime: '5 min',
    spicyLevel: 0
  },
  { 
    id: 20, 
    name: 'Fries', 
    description: 'Crispy seasoned fries with house BBQ dust', 
    price: 3.99, 
    category: 'sides', 
    image: '🍟', 
    popular: false,
    ingredients: ['Russet potatoes', 'BBQ seasoning', 'Sea salt'],
    tags: ['Vegan', 'Crispy'],
    calories: 380,
    prepTime: '8 min',
    spicyLevel: 0
  },
  { 
    id: 21, 
    name: 'Collard Greens', 
    description: 'Southern-style collards slow-cooked with smoked ham hock', 
    price: 4.99, 
    category: 'sides', 
    image: '🥬', 
    popular: false,
    ingredients: ['Collard greens', 'Ham hock', 'Onions', 'Garlic'],
    tags: ['Southern Classic'],
    calories: 150,
    prepTime: '5 min',
    spicyLevel: 0
  },
  { 
    id: 22, 
    name: 'Jalapeño Poppers', 
    description: 'Cream cheese stuffed jalapeños wrapped in bacon', 
    price: 7.99, 
    category: 'sides', 
    image: '🌶️', 
    popular: true,
    ingredients: ['Jalapeños', 'Cream cheese', 'Bacon', 'Cheddar'],
    tags: ['Spicy', 'Appetizer'],
    calories: 420,
    prepTime: '12 min',
    spicyLevel: 2
  },

  // Drinks
  { 
    id: 23, 
    name: 'Sweet Tea', 
    description: 'Classic Southern sweet tea brewed fresh daily', 
    price: 2.99, 
    category: 'drinks', 
    image: '🥤', 
    popular: true,
    ingredients: ['Black tea', 'Cane sugar', 'Lemon'],
    tags: ['Refreshing', 'Free Refills'],
    calories: 120,
    prepTime: '2 min',
    spicyLevel: 0
  },
  { 
    id: 24, 
    name: 'Lemonade', 
    description: 'Fresh-squeezed lemonade with a hint of mint', 
    price: 3.49, 
    category: 'drinks', 
    image: '🍋', 
    popular: false,
    ingredients: ['Fresh lemons', 'Cane sugar', 'Mint', 'Sparkling water'],
    tags: ['Refreshing'],
    calories: 140,
    prepTime: '3 min',
    spicyLevel: 0
  },
  { 
    id: 25, 
    name: 'Craft Beer', 
    description: 'Selection of local craft beers on tap', 
    price: 5.99, 
    category: 'drinks', 
    image: '🍺', 
    popular: true,
    ingredients: ['Local craft beer'],
    tags: ['21+ Only', 'Local'],
    calories: 180,
    prepTime: '2 min',
    spicyLevel: 0
  },
  { 
    id: 26, 
    name: 'Iced Coffee', 
    description: 'Cold brew iced coffee with vanilla and cream', 
    price: 3.99, 
    category: 'drinks', 
    image: '☕', 
    popular: false,
    ingredients: ['Cold brew coffee', 'Vanilla', 'Cream'],
    tags: ['Caffeinated'],
    calories: 80,
    prepTime: '2 min',
    spicyLevel: 0
  },
  { 
    id: 27, 
    name: 'Root Beer Float', 
    description: 'Classic root beer with vanilla ice cream', 
    price: 4.99, 
    category: 'drinks', 
    image: '🍦', 
    popular: true,
    ingredients: ['Root beer', 'Vanilla ice cream'],
    tags: ['Kids Love It', 'Sweet'],
    calories: 320,
    prepTime: '3 min',
    spicyLevel: 0
  },

  // Desserts
  { 
    id: 28, 
    name: 'Pecan Pie', 
    description: 'Traditional Southern pecan pie with whipped cream', 
    price: 6.99, 
    category: 'desserts', 
    image: '🥧', 
    popular: true,
    ingredients: ['Pecans', 'Brown sugar', 'Butter', 'Pie crust'],
    tags: ['House Made', 'Classic'],
    calories: 480,
    prepTime: '5 min',
    spicyLevel: 0
  },
  { 
    id: 29, 
    name: 'Banana Pudding', 
    description: 'Creamy vanilla pudding with fresh bananas and wafers', 
    price: 5.99, 
    category: 'desserts', 
    image: '🍌', 
    popular: true,
    ingredients: ['Vanilla pudding', 'Bananas', 'Vanilla wafers', 'Whipped cream'],
    tags: ['Southern Classic'],
    calories: 380,
    prepTime: '5 min',
    spicyLevel: 0
  },
  { 
    id: 30, 
    name: 'Chocolate Brownie', 
    description: 'Warm fudge brownie with vanilla ice cream and chocolate sauce', 
    price: 7.99, 
    category: 'desserts', 
    image: '🍫', 
    popular: false,
    ingredients: ['Chocolate', 'Butter', 'Vanilla ice cream', 'Chocolate sauce'],
    tags: ['Indulgent'],
    calories: 650,
    prepTime: '8 min',
    spicyLevel: 0
  }
]

// Helper functions
export const getItemsByCategory = (category) => {
  if (category === 'all') return menuItems
  return menuItems.filter(item => item.category === category)
}

export const getPopularItems = () => {
  return menuItems.filter(item => item.popular)
}

export const searchItems = (searchTerm) => {
  const term = searchTerm.toLowerCase()
  return menuItems.filter(item => 
    item.name.toLowerCase().includes(term) ||
    item.description.toLowerCase().includes(term) ||
    item.tags.some(tag => tag.toLowerCase().includes(term))
  )
}

export const getItemById = (id) => {
  return menuItems.find(item => item.id === id)
}

export const filterItems = (category, searchTerm) => {
  let filtered = menuItems

  if (category !== 'all') {
    filtered = filtered.filter(item => item.category === category)
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    )
  }

  return filtered
}

export default menuItems