// ===== server/config/db.js =====
import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes('<user>') || mongoUri.includes('mongodb+srv://')) {
    console.warn('⚠️ MONGO_URI is not configured or has placeholder values. Using local JSON-file fallback database.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    console.log('⚠️ Falling back to local JSON-file database.');
    return false;
  }
}

export function getIsConnected() {
  return isConnected;
}
