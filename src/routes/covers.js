const express = require('express');
const mongoose = require('mongoose');
const CoverImage = require('../models/CoverImage');

const router = express.Router();

router.get('/covers/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
    const cover = await CoverImage.findById(req.params.id);
    if (!cover) return res.status(404).end();
    res.set('Content-Type', cover.contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(cover.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
