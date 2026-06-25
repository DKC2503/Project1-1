const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    articleId: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
