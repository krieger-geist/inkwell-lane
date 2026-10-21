const path = require('path');
const express = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const connectDB = require('./config/db');

const locals = require('./middleware/locals');
const shopRoutes = require('./routes/shop');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const coverRoutes = require('./routes/covers');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Vercel (and most hosts) terminate HTTPS at a proxy in front of the app.
app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: isProduction ? '7d' : 0 }));
app.use(express.urlencoded({ extended: true }));

// Make sure MongoDB is connected before any route runs. On a long-running
// server this resolves instantly after the first request; on Vercel it
// reuses the cached connection between invocations.
app.use((req, res, next) => {
  connectDB().then(() => next(), next);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'inkwell-lane-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: connectDB().then((m) => m.connection.getClient()),
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 * 30,
    touchAfter: 60 * 60 * 24
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}));
app.use(locals);

app.use('/', coverRoutes);
app.use('/', shopRoutes);
app.use('/', cartRoutes);
app.use('/', orderRoutes);
app.use('/', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page not found' });
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const isUploadError = err && (err.name === 'MulterError' || /images|4 MB/i.test(err.message || ''));
  if (isUploadError) {
    return res.status(400).send(err.message || 'Upload failed.');
  }
  console.error(err);
  res.status(500).render('error', {
    title: 'Something went wrong',
    message: isProduction
      ? 'An unexpected error occurred.'
      : err.message
  });
});

module.exports = app;
