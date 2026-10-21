const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const { escapeRegex, categorySummary } = require('../utils/books');

const router = express.Router();

// Home page: hero + latest arrivals + popular categories
router.get('/', async (req, res, next) => {
  try {
    const [latest, allBooks] = await Promise.all([
      Book.find().sort({ createdAt: -1 }).limit(4),
      Book.find({}, 'category').lean()
    ]);
    res.render('home', {
      title: 'Home',
      latest,
      categories: categorySummary(allBooks).slice(0, 6)
    });
  } catch (err) {
    next(err);
  }
});

// Browse: search + category filter in one place
router.get('/books', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 100);
    const category = String(req.query.category || '').trim().slice(0, 50);

    const filter = {};
    if (q) {
      const pattern = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: pattern }, { author: pattern }];
    }
    if (category) {
      filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    }

    const [books, allBooks] = await Promise.all([
      Book.find(filter).sort({ title: 1 }),
      Book.find({}, 'category').lean()
    ]);

    res.render('books', {
      title: 'Browse books',
      books,
      categories: categorySummary(allBooks),
      q,
      category
    });
  } catch (err) {
    next(err);
  }
});

// Book detail
router.get('/books/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).render('404', { title: 'Not found' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).render('404', { title: 'Not found' });

    const related = await Book.find({
      _id: { $ne: book._id },
      category: new RegExp(`^${escapeRegex(book.category || '')}$`, 'i')
    }).limit(4);

    res.render('book', { title: book.title, book, related, added: req.query.added === '1' });
  } catch (err) {
    next(err);
  }
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

module.exports = router;
