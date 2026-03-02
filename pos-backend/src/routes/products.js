const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const Product = require('../models/Product');

// ✅ Import auth middleware properly
const authImport = require('../middleware/auth');
const auth = typeof authImport === 'function'
  ? authImport
  : authImport?.verifyToken || authImport?.authenticate || authImport?.default;

// ✅ Debug: Check if controller methods exist
console.log('🔍 Product controller methods:', Object.keys(productController));
console.log('🔍 Auth middleware:', typeof auth);

// ✅ Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// ✅ Protected routes - MAKE SURE THESE EXIST
if (auth && typeof auth === 'function') {
  router.post('/', auth, productController.createProduct);
  router.patch('/:id', auth, productController.updateProduct);
  router.delete('/:id', auth, productController.deleteProduct);
} else {
  console.warn('⚠️ Auth middleware not found, routes are unprotected!');
  router.post('/', productController.createProduct);
  router.patch('/:id', productController.updateProduct);
  router.delete('/:id', productController.deleteProduct);
}

module.exports = router;