import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: String,
  popular: { type: Boolean, default: false },
  ingredients: [String],
  tags: [String],
  calories: Number,
  prepTime: String,
  spicyLevel: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);