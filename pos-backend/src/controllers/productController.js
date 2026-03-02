const Product = require('../models/Product');
const mongoose = require('mongoose');

// ✅ Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ✅ Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    console.log('🔍 Getting product by ID:', req.params.id);
    
    if (!isValidObjectId(req.params.id)) {
      console.log('❌ Invalid ID format');
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('✅ Product found:', product.name);
    res.json(product);
  } catch (error) {
    console.error('❌ Error in getProductById:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create product
exports.createProduct = async (req, res) => {
  try {
    console.log('📝 Creating product:', req.body);
    
    const { name, description, price, category, image, prepTime, inStock } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const product = new Product({
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image: image || '',
      prepTime: prepTime || '15 mins',
      inStock: inStock !== undefined ? inStock : true
    });

    await product.save();
    console.log('✅ Product created:', product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    console.log('📝 Update request for ID:', req.params.id);
    console.log('📦 Update data:', req.body);
    console.log('👤 User ID:', req.userId);
    
    if (!isValidObjectId(req.params.id)) {
      console.log('❌ Invalid ID format');
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { name, description, price, category, image, prepTime, inStock } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (inStock !== undefined) updateData.inStock = inStock;

    console.log('📦 Final update data:', updateData);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      console.log('❌ Product not found in database');
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('✅ Product updated successfully:', product._id);
    res.json(product);
  } catch (error) {
    console.error('❌ Error updating product:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Full error:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      message: error.message,
      errorName: error.name,
      details: error.toString()
    });
  }
};

// ✅ Delete product
exports.deleteProduct = async (req, res) => {
  try {
    console.log('🗑️ Delete request for ID:', req.params.id);
    console.log('👤 User ID:', req.userId);
    
    if (!isValidObjectId(req.params.id)) {
      console.log('❌ Invalid ID format');
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('✅ Product deleted:', product.name);
    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error('❌ Error deleting product:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};