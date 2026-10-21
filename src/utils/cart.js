const mongoose = require('mongoose');
const Book = require('../models/Book');

async function getCartItems(cart) {
  const entries = Object.entries(cart || {})
    .filter(([id]) => mongoose.isValidObjectId(id));

  if (!entries.length) {
    return { items: [], staleIds: Object.keys(cart || {}) };
  }

  const books = await Book.find({ _id: { $in: entries.map(([id]) => id) } });
  const byId = new Map(books.map((book) => [String(book._id), book]));
  const items = [];
  const staleIds = [];

  for (const [id, quantity] of entries) {
    const book = byId.get(id);
    if (!book) {
      staleIds.push(id);
      continue;
    }
    items.push({ book, quantity, lineTotal: Number(book.price) * quantity });
  }

  return { items, staleIds };
}

function cartTotal(items) {
  return items.reduce((total, item) => total + item.lineTotal, 0);
}

module.exports = { getCartItems, cartTotal };
