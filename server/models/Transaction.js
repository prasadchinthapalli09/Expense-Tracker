// ===== server/models/Transaction.js =====
import mongoose, { Schema } from 'mongoose';
import { getIsConnected } from '../config/db.js';
import { readDb, writeDb } from '../config/localDb.js';

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { 
    type: String, 
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Salary', 'Freelance', 'Other'], 
    required: true 
  },
  date: { type: Date, required: true },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const MongoTransaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export const TransactionModel = {
  async find(filter) {
    if (getIsConnected()) {
      const query = { userId: filter.userId };
      if (filter.type) query.type = filter.type;
      if (filter.category) query.category = filter.category;
      if (filter.startDate || filter.endDate) {
        query.date = {};
        if (filter.startDate) query.date.$gte = filter.startDate;
        if (filter.endDate) query.date.$lte = filter.endDate;
      }
      return await MongoTransaction.find(query).sort({ date: -1 });
    }

    const db = readDb();
    let txs = db.transactions.filter(t => t.userId === filter.userId);
    
    if (filter.type) {
      txs = txs.filter(t => t.type === filter.type);
    }
    if (filter.category) {
      txs = txs.filter(t => t.category === filter.category);
    }
    if (filter.startDate) {
      const startMs = new Date(filter.startDate).getTime();
      txs = txs.filter(t => new Date(t.date).getTime() >= startMs);
    }
    if (filter.endDate) {
      const endMs = new Date(filter.endDate).getTime();
      txs = txs.filter(t => new Date(t.date).getTime() <= endMs);
    }

    // Sort by date desc
    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return txs.map(t => ({
      _id: t.id,
      id: t.id,
      userId: t.userId,
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: new Date(t.date),
      notes: t.notes,
      createdAt: new Date(t.createdAt)
    }));
  },

  async findById(id) {
    if (getIsConnected()) {
      return await MongoTransaction.findById(id);
    }

    const db = readDb();
    const t = db.transactions.find(tx => tx.id === id);
    if (!t) return null;
    return {
      _id: t.id,
      id: t.id,
      userId: t.userId,
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: new Date(t.date),
      notes: t.notes,
      createdAt: new Date(t.createdAt)
    };
  },

  async create(txData) {
    if (getIsConnected()) {
      return await MongoTransaction.create({
        userId: txData.userId,
        title: txData.title,
        amount: txData.amount,
        type: txData.type,
        category: txData.category,
        date: txData.date,
        notes: txData.notes || ''
      });
    }

    const db = readDb();
    const newTx = {
      id: 'tx_' + Math.random().toString(36).substring(2, 11),
      userId: txData.userId,
      title: txData.title,
      amount: Number(txData.amount),
      type: txData.type,
      category: txData.category,
      date: txData.date.toISOString(),
      notes: txData.notes || '',
      createdAt: new Date().toISOString()
    };
    db.transactions.push(newTx);
    writeDb(db);
    return {
      _id: newTx.id,
      id: newTx.id,
      userId: newTx.userId,
      title: newTx.title,
      amount: newTx.amount,
      type: newTx.type,
      category: newTx.category,
      date: new Date(newTx.date),
      notes: newTx.notes,
      createdAt: new Date(newTx.createdAt)
    };
  },

  async findByIdAndUpdate(id, updateData) {
    if (getIsConnected()) {
      return await MongoTransaction.findByIdAndUpdate(id, updateData, { new: true });
    }

    const db = readDb();
    const index = db.transactions.findIndex(tx => tx.id === id);
    if (index === -1) return null;

    const existing = db.transactions[index];
    const updated = {
      ...existing,
      title: updateData.title !== undefined ? updateData.title : existing.title,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : existing.amount,
      type: updateData.type !== undefined ? updateData.type : existing.type,
      category: updateData.category !== undefined ? updateData.category : existing.category,
      date: updateData.date !== undefined ? new Date(updateData.date).toISOString() : existing.date,
      notes: updateData.notes !== undefined ? updateData.notes : existing.notes
    };

    db.transactions[index] = updated;
    writeDb(db);
    return {
      _id: updated.id,
      id: updated.id,
      userId: updated.userId,
      title: updated.title,
      amount: updated.amount,
      type: updated.type,
      category: updated.category,
      date: new Date(updated.date),
      notes: updated.notes,
      createdAt: new Date(updated.createdAt)
    };
  },

  async findByIdAndDelete(id) {
    if (getIsConnected()) {
      return await MongoTransaction.findByIdAndDelete(id);
    }

    const db = readDb();
    const initialLength = db.transactions.length;
    db.transactions = db.transactions.filter(tx => tx.id !== id);
    if (db.transactions.length === initialLength) return null;
    writeDb(db);
    return { _id: id };
  }
};
