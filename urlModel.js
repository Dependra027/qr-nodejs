const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    urls: { type: String, required: [true, "Enter URL to convert"], index: true }
  },
  { timestamps: true }
);

// Correct indexing
urlSchema.index({ urls: 'text' });

module.exports = mongoose.model('UrlModel', urlSchema);
