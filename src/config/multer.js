const multer = require('multer');

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Files are kept in memory and saved to MongoDB (see models/CoverImage).
// 4 MB keeps uploads under Vercel's 4.5 MB request body limit.
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG, PNG, WEBP or GIF images (max 4 MB) are allowed.'));
  }
});
