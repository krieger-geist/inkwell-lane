const mongoose = require('mongoose');

// Uploaded book covers are stored in MongoDB rather than on disk, so they
// survive on hosts with a read-only or ephemeral filesystem (e.g. Vercel).
const coverImageSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CoverImage', coverImageSchema);
