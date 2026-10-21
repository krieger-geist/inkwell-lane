const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Order = require('../models/Order');
const CoverImage = require('../models/CoverImage');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
const VALID_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
const COVER_PATH = /^\/covers\/([a-f0-9]{24})$/;

async function saveCover(file) {
  const cover = await CoverImage.create({ data: file.buffer, contentType: file.mimetype });
  return `/covers/${cover._id}`;
}

async function removeCover(imagePath) {
  const match = COVER_PATH.exec(imagePath || '');
  if (match) await CoverImage.findByIdAndDelete(match[1]);
}

function readImageUrl(body) {
  const url = String(body.imageUrl || '').trim();
  if (!url) return { url: '' };
  if (url.length > 500 || !/^https?:\/\/\S+$/i.test(url)) {
    return { url: '', error: 'Cover image URL must start with http:// or https://.' };
  }
  return { url };
}

function readBookInput(body) {
  const publicationYearInput = String(body.publicationYear || '').trim();
  const pagesInput = String(body.pages || '').trim();
  const data = {
    title: String(body.title || '').trim(),
    author: String(body.author || '').trim(),
    category: String(body.category || '').trim(),
    description: String(body.description || '').trim(),
    price: Number(body.price),
    isbn: String(body.isbn || '').trim(),
    publisher: String(body.publisher || '').trim(),
    publicationYear: publicationYearInput ? Number(publicationYearInput) : undefined,
    pages: pagesInput ? Number(pagesInput) : undefined,
    language: String(body.language || '').trim(),
    format: String(body.format || '').trim()
  };
  const limits = {
    title: 150,
    author: 100,
    category: 50,
    description: 2000,
    isbn: 20,
    publisher: 120,
    language: 50,
    format: 30
  };
  const errors = [];
  if (!data.title) errors.push('Title is required.');
  for (const [field, max] of Object.entries(limits)) {
    if (data[field].length > max) errors.push(`${field} must be under ${max} characters.`);
  }
  if (!Number.isFinite(data.price) || data.price <= 0) {
    errors.push('Enter a valid price greater than 0.');
  }
  if (publicationYearInput && (
    !Number.isInteger(data.publicationYear)
    || data.publicationYear < 1450
    || data.publicationYear > new Date().getFullYear() + 5
  )) {
    errors.push(`Publication year must be between 1450 and ${new Date().getFullYear() + 5}.`);
  }
  if (pagesInput && (!Number.isInteger(data.pages) || data.pages < 1)) {
    errors.push('Page count must be a positive whole number.');
  }
  return { data, errors };
}

// ----- auth -----
router.get('/admin/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/orders');
  res.render('admin/login', { title: 'Admin login', error: null });
});

router.post('/admin/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return req.session.save((err) => {
      if (err) return res.status(500).send('Something went wrong, please try again.');
      res.redirect('/admin/orders');
    });
  }
  res.status(401).render('admin/login', {
    title: 'Admin login',
    error: 'Incorrect username or password.'
  });
});

router.get('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ----- orders -----
router.get('/admin/orders', requireAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('admin/orders', {
      title: 'Manage orders',
      orders,
      statusUpdated: req.query.status === 'updated'
    });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/orders/:id/status', requireAdmin, async (req, res, next) => {
  try {
    if (!VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).send('Invalid order status.');
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).send('Order not found.');
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).send('Order not found.');
    res.redirect('/admin/orders?status=updated');
  } catch (err) {
    next(err);
  }
});

// ----- catalog -----
router.get('/admin/books', requireAdmin, async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.render('admin/books', {
      title: 'Manage books',
      books,
      saved: req.query.saved === '1',
      deleted: req.query.deleted === '1'
    });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/books/new', requireAdmin, (req, res) => {
  res.render('admin/book-form', {
    title: 'Add a book',
    book: null,
    errors: [],
    values: {}
  });
});

router.post('/admin/books', requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    const { data, errors } = readBookInput(req.body);
    const imageUrl = readImageUrl(req.body);
    if (imageUrl.error) errors.push(imageUrl.error);
    else if (!req.file && !imageUrl.url) errors.push('Upload a cover image or paste a cover image URL.');
    if (errors.length) {
      return res.status(400).render('admin/book-form', {
        title: 'Add a book', book: null, errors, values: req.body
      });
    }
    data.image = req.file ? await saveCover(req.file) : imageUrl.url;
    await Book.create(data);
    res.redirect('/admin/books?saved=1');
  } catch (err) {
    next(err);
  }
});

router.get('/admin/books/:id/edit', requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).render('404', { title: 'Not found' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).render('404', { title: 'Not found' });
    res.render('admin/book-form', { title: `Edit ${book.title}`, book, errors: [], values: null });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/books/:id', requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).render('404', { title: 'Not found' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).render('404', { title: 'Not found' });

    const { data, errors } = readBookInput(req.body);
    const imageUrl = readImageUrl(req.body);
    if (imageUrl.error) errors.push(imageUrl.error);
    if (errors.length) {
      return res.status(400).render('admin/book-form', {
        title: `Edit ${book.title}`, book, errors, values: req.body
      });
    }
    const previousImage = book.image;
    Object.assign(book, data);
    if (req.file) book.image = await saveCover(req.file);
    else if (imageUrl.url) book.image = imageUrl.url;
    await book.save();
    if (book.image !== previousImage) await removeCover(previousImage);
    res.redirect('/admin/books?saved=1');
  } catch (err) {
    next(err);
  }
});

router.post('/admin/books/:id/delete', requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.isValidObjectId(req.params.id)) {
      const book = await Book.findByIdAndDelete(req.params.id);
      if (book) await removeCover(book.image);
    }
    res.redirect('/admin/books?deleted=1');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
