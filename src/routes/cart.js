const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const { getCartItems, cartTotal } = require('../utils/cart');

const router = express.Router();
const MAX_QUANTITY = 20;

router.post('/cart/add/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).send('Book not found.');
    }
    const book = await Book.findById(id);
    if (!book) return res.status(404).send('Book not found.');

    const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return res.status(400).send(`Quantity must be a whole number between 1 and ${MAX_QUANTITY}.`);
    }

    const cart = req.session.cart || (req.session.cart = {});
    cart[id] = Math.min((cart[id] || 0) + quantity, MAX_QUANTITY);

    if (req.body.stay) return res.redirect(`/books/${id}?added=1`);
    res.redirect('/cart?added=1');
  } catch (err) {
    next(err);
  }
});

router.get('/cart', async (req, res, next) => {
  try {
    const { items, staleIds } = await getCartItems(req.session.cart);
    for (const id of staleIds) delete req.session.cart[id];

    res.render('cart', {
      title: 'Your cart',
      items,
      total: cartTotal(items),
      justAdded: req.query.added === '1',
      quantityUpdated: req.query.updated === '1',
      itemRemoved: req.query.removed === '1',
      attemptedEmptyCheckout: req.query.empty === '1',
      removedUnavailable: staleIds.length > 0
    });
  } catch (err) {
    next(err);
  }
});

router.post('/cart/update/:id', async (req, res, next) => {
  try {
    const cart = req.session.cart || {};
    const quantity = Number(req.body.quantity);

    if (!Object.prototype.hasOwnProperty.call(cart, req.params.id)) {
      return res.status(404).send('This book is not in your cart.');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return res.status(400).send(`Quantity must be a whole number between 1 and ${MAX_QUANTITY}.`);
    }

    cart[req.params.id] = quantity;
    res.redirect('/cart?updated=1');
  } catch (err) {
    next(err);
  }
});

router.post('/cart/remove/:id', (req, res) => {
  if (req.session.cart) delete req.session.cart[req.params.id];
  res.redirect('/cart?removed=1');
});

module.exports = router;
