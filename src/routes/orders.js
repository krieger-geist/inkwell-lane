const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { getCartItems, cartTotal } = require('../utils/cart');

const router = express.Router();

router.get('/checkout', async (req, res, next) => {
  try {
    const { items, staleIds } = await getCartItems(req.session.cart);
    for (const id of staleIds) delete req.session.cart[id];
    if (!items.length) return res.redirect('/cart?empty=1');

    res.render('checkout', { title: 'Checkout', items, total: cartTotal(items) });
  } catch (err) {
    next(err);
  }
});

router.post('/checkout', async (req, res, next) => {
  try {
    const { items } = await getCartItems(req.session.cart);
    if (!items.length) return res.redirect('/cart?empty=1');

    const shipping = {
      name: String(req.body.name || '').trim(),
      phone: String(req.body.phone || '').trim(),
      address: String(req.body.address || '').trim(),
      city: String(req.body.city || '').trim(),
      postalCode: String(req.body.postalCode || '').trim()
    };
    const limits = { name: 100, phone: 30, address: 200, city: 100, postalCode: 20 };
    const invalid = Object.entries(limits).find(
      ([field, max]) => !shipping[field] || shipping[field].length > max
    );
    if (invalid || shipping.phone.length < 7) {
      return res.status(400).render('checkout', {
        title: 'Checkout',
        items,
        total: cartTotal(items),
        error: 'Please fill in every delivery field. Phone needs at least 7 digits.',
        values: req.body
      });
    }

    const orderItems = items.map(({ book, quantity }) => ({
      book: book._id,
      title: book.title,
      author: book.author,
      image: book.image,
      price: Number(book.price),
      quantity
    }));

    const order = await Order.create({
      sessionId: req.sessionID,
      items: orderItems,
      shipping,
      total: cartTotal(items)
    });

    req.session.cart = {};
    res.redirect(`/orders/${order._id}?placed=1`);
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find({ sessionId: req.sessionID }).sort({ createdAt: -1 });
    res.render('orders', { title: 'My orders', orders });
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).render('404', { title: 'Not found' });
    }
    const order = req.session.isAdmin
      ? await Order.findById(req.params.id)
      : await Order.findOne({ _id: req.params.id, sessionId: req.sessionID });
    if (!order) return res.status(404).render('404', { title: 'Not found' });

    res.render('order', {
      title: `Order ${String(order._id).slice(-8).toUpperCase()}`,
      order,
      placed: req.query.placed === '1'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
