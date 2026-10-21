// Vercel serverless entry point. Vercel calls the exported Express app
// for every request that is not a static file in /public.
require('dotenv').config();

module.exports = require('../src/app');
