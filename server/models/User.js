// ===== server/models/User.js =====
import mongoose, { Schema } from 'mongoose';
import { getIsConnected } from '../config/db.js';
import { readDb, writeDb } from '../config/localDb.js';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  budgets: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);

export const UserModel = {
  async findOne(filter) {
    if (getIsConnected()) {
      if (filter.email) {
        return await MongoUser.findOne({ email: filter.email.toLowerCase() });
      }
      return null;
    }
    
    const db = readDb();
    if (filter.email) {
      const u = db.users.find(user => user.email.toLowerCase() === filter.email.toLowerCase());
      if (!u) return null;
      return {
        _id: u.id,
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        budgets: u.budgets || {},
        createdAt: new Date(u.createdAt)
      };
    }
    return null;
  },

  async findById(id) {
    if (getIsConnected()) {
      return await MongoUser.findById(id);
    }
    
    const db = readDb();
    const u = db.users.find(user => user.id === id);
    if (!u) return null;
    return {
      _id: u.id,
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      budgets: u.budgets || {},
      createdAt: new Date(u.createdAt)
    };
  },

  async create(userData) {
    if (getIsConnected()) {
      return await MongoUser.create({
        name: userData.name,
        email: userData.email.toLowerCase(),
        passwordHash: userData.passwordHash,
        budgets: {},
      });
    }
    
    const db = readDb();
    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      budgets: {},
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDb(db);
    return {
      _id: newUser.id,
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      passwordHash: newUser.passwordHash,
      budgets: newUser.budgets,
      createdAt: new Date(newUser.createdAt)
    };
  },

  async updateBudgets(id, budgets) {
    if (getIsConnected()) {
      return await MongoUser.findByIdAndUpdate(id, { budgets }, { new: true });
    }
    
    const db = readDb();
    const index = db.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    db.users[index].budgets = budgets || {};
    writeDb(db);
    return {
      _id: db.users[index].id,
      id: db.users[index].id,
      name: db.users[index].name,
      email: db.users[index].email,
      passwordHash: db.users[index].passwordHash,
      budgets: db.users[index].budgets,
      createdAt: new Date(db.users[index].createdAt)
    };
  }
};
