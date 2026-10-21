const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/inkwell-lane';

// Cache the connection promise so serverless invocations (Vercel) reuse
// one connection instead of opening a new one per request.
let connecting = null;

function connectDB(uri = process.env.MONGODB_URI || DEFAULT_URI) {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (!connecting) {
    mongoose.set('strictQuery', true);
    connecting = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
      .then((conn) => {
        console.log('Connected to MongoDB');
        return conn;
      })
      .catch((err) => {
        connecting = null;
        throw err;
      });
  }
  return connecting;
}

module.exports = connectDB;
