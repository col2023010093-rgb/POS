const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload');  // ✅ Add this

// ✅ Import auth middleware properly
const authImport = require('../middleware/auth');
const auth = typeof authImport === 'function'
  ? authImport
  : authImport?.verifyToken || authImport?.authenticate || authImport?.default;

console.log('🔍 Auth middleware:', typeof auth);

// ✅ Public routes
// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Protected routes with image upload
if (auth && typeof auth === 'function') {
  // Create product with image upload
  router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        prepTime: req.body.prepTime,
        inStock: req.body.inStock !== undefined ? req.body.inStock : true,
        popular: req.body.popular !== undefined ? req.body.popular : false,
        ingredients: req.body.ingredients ? JSON.parse(req.body.ingredients) : []
      };

      if (req.file) {
        productData.image = `/images/products/${req.file.filename}`;
      }

      const product = new Product(productData);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      console.error('❌ Error creating product:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Update product with optional image upload
  router.patch('/:id', auth, upload.single('image'), async (req, res) => {
    try {
      const updateData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        prepTime: req.body.prepTime,
        inStock: req.body.inStock,
        popular: req.body.popular
      };

      if (req.body.ingredients) {
        updateData.ingredients = JSON.parse(req.body.ingredients);
      }
      
      if (req.file) {
        updateData.image = `/images/products/${req.file.filename}`;
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('❌ Error updating product:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Delete product
  router.delete('/:id', auth, async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk import products
  router.post('/bulk-import', auth, async (req, res) => {
    try {
      const { products } = req.body;
      
      if (!Array.isArray(products)) {
        return res.status(400).json({ message: 'Products must be an array' });
      }

      const imported = await Product.insertMany(products);
      res.json({ 
        message: `Successfully imported ${imported.length} products`,
        products: imported 
      });
    } catch (error) {
      console.error('❌ Error importing products:', error);
      res.status(500).json({ message: error.message });
    }
  });

} else {
  console.warn('⚠️ Auth middleware not found, routes are unprotected!');
  
  // Fallback unprotected routes (for development only)
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      const productData = {
        ...req.body,
        image: req.file ? `/images/products/${req.file.filename}` : ''
      };
      const product = new Product(productData);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  router.patch('/:id', upload.single('image'), async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.image = `/images/products/${req.file.filename}`;
      }
      const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}

module.exports = router;