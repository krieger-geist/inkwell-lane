const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/inkwell-lane';

// Cache the connection promise so serverless invocations (Vercel) reuse
// one connection instead of opening a new one per request.
let connecting = null;

function databaseError(message, cause) {
  const err = new Error(message);
  err.isDatabaseError = true;
  if (cause) err.cause = cause;
  return err;
}

function connectDB(uri = process.env.MONGODB_URI) {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  if (!uri) {
    // A local MongoDB only exists on your own machine, never on Vercel.
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      return Promise.reject(databaseError(
        'MONGODB_URI is not set. Add your MongoDB Atlas connection string under '
        + 'Vercel → Project → Settings → Environment Variables, then redeploy.'
      ));
    }
    uri = DEFAULT_URI;
  }

  if (!connecting) {
    mongoose.set('strictQuery', true);
    connecting = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then((conn) => {
        console.log('Connected to MongoDB');
        return conn;
      })
      .catch((err) => {
        connecting = null;
        throw databaseError(
          `Could not connect to MongoDB: ${err.message}. Check that MONGODB_URI is correct `
          + 'and that MongoDB Atlas → Network Access allows 0.0.0.0/0.',
          err
        );
      });
  }
  return connecting;
}

module.exports = connectDB;
