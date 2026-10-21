const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Message = require('../models/Message');
const { escapeRegex, categorySummary } = require('../utils/books');

const router = express.Router();

// Home is a single long page: hero, the whole catalog, how ordering
// works, about the store and the contact form.
async function renderHome(req, res, extra = {}) {
  const books = await Book.find().sort({ createdAt: -1 });
  res.status(extra.status || 200).render('home', {
    title: 'Home',
    books,
    categories: categorySummary(books),
    subjects: Message.SUBJECTS,
    contactSent: req.query.sent === '1',
    contactErrors: [],
    contactValues: {},
    ...extra
  });
}

function readContactInput(body) {
  const values = {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim(),
    subject: String(body.subject || '').trim(),
    orderNumber: String(body.orderNumber || '').trim().replace(/^#/, ''),
    message: String(body.message || '').trim()
  };
  const errors = [];
  if (!values.name || values.name.length > 100) errors.push('Please enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 150) {
    errors.push('Please enter a valid email address.');
  }
  if (values.phone && !/^[0-9+()\-\s]{7,20}$/.test(values.phone)) {
    errors.push('Phone number can only contain digits, spaces, +, - and brackets.');
  }
  if (!Message.SUBJECTS.includes(values.subject)) errors.push('Please choose what your message is about.');
  if (values.orderNumber.length > 20) errors.push('Order number looks too long.');
  if (values.message.length < 10 || values.message.length > 2000) {
    errors.push('Your message should be between 10 and 2000 characters.');
  }
  return { values, errors };
}

router.get('/', async (req, res, next) => {
  try {
    await renderHome(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/contact', async (req, res, next) => {
  try {
    const { values, errors } = readContactInput(req.body);
    if (errors.length) {
      return await renderHome(req, res, {
        status: 400, contactErrors: errors, contactValues: values, scrollTo: 'contact'
      });
    }
    await Message.create(values);
    res.redirect('/?sent=1#contact');
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

// About and Contact live on the home page now; keep the old URLs working.
router.get('/about', (req, res) => res.redirect('/#about'));
router.get('/contact', (req, res) => res.redirect('/#contact'));

module.exports = router;
