const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, trim: true, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  image: { type: String, default: '' },
  isbn: { type: String, trim: true, default: '' },
  publisher: { type: String, trim: true, default: '' },
  publicationYear: { type: Number, min: 1450 },
  pages: { type: Number, min: 1 },
  language: { type: String, trim: true, default: '' },
  format: { type: String, trim: true, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
