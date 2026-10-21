const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  title: { type: String, required: true },
  author: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 20 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  shipping: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
