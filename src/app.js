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

// Template defaults, so error pages can render even if the database or
// session middleware below fails before `locals` runs.
app.use((req, res, next) => {
  res.locals.isAdmin = false;
  res.locals.cartCount = 0;
  res.locals.currentPath = req.path;
  next();
});

// Connect to MongoDB before any route runs, then build the session
// middleware on the live client. On a long-running server this happens
// once; on Vercel the cached connection is reused between invocations, and
// a failed connection is retried on the next request.
let sessionMiddleware = null;
app.use((req, res, next) => {
  connectDB().then((m) => {
    if (!sessionMiddleware) {
      sessionMiddleware = session({
        secret: process.env.SESSION_SECRET || 'inkwell-lane-dev-secret-change-me',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          client: m.connection.getClient(),
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
      });
    }
    sessionMiddleware(req, res, next);
  }, next);
});
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
  if (err && err.isDatabaseError) {
    return res.status(503).render('error', {
      title: 'Store temporarily unavailable',
      message: 'We could not reach our database. Please try again in a moment.'
    });
  }
  res.status(500).render('error', {
    title: 'Something went wrong',
    message: isProduction
      ? 'An unexpected error occurred.'
      : err.message
  });
});

module.exports = app;
