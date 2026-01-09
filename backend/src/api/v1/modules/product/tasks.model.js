const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  keyword: { 
    type: String, 
    required: true, 
    index: true, 
    trim: true 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  type: { 
    type: String, 
    default: 'alias' 
  },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Tasks', taskSchema);