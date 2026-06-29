// ===== server/config/localDb.js =====
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDbExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], transactions: [] }, null, 2), 'utf-8');
  }
}

export function readDb() {
  ensureDbExists();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local DB file, returning empty state:', err);
    return { users: [], transactions: [] };
  }
}

export function writeDb(data) {
  ensureDbExists();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local DB file:', err);
  }
}
