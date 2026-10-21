const mongoose = require('mongoose');

const SUBJECTS = ['Order enquiry', 'Book request', 'Returns & replacements', 'Feedback', 'Other'];

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true, default: '' },
  subject: { type: String, enum: SUBJECTS, default: 'Other' },
  orderNumber: { type: String, trim: true, default: '' },
  message: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
module.exports.SUBJECTS = SUBJECTS;
