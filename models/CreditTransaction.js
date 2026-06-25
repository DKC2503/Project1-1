const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    creditType: { type: String, required: true },
    description: { type: String },
    credits: { type: Number, required: true }, // positive for awards, negative for deductions
    source: { type: String, default: 'SYSTEM' }, // SYSTEM, ADMIN, AUTOMATED
    referenceId: { type: String }, // e.g., articleId, userId
    createdAt: { type: Date, default: Date.now }
});

creditTransactionSchema.index({ userId: 1, createdAt: -1 });
creditTransactionSchema.index({ role: 1 });

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
