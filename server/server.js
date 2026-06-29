// ===== server/server.js =====
import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  // Connect to database (either real Mongo or fallback to local JSON file)
  await connectDB();

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', database: process.env.MONGO_URI ? 'mongodb' : 'local-json' });
  });

  // Serve Frontend
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const distPath = path.join(projectRoot, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('🚀 Serving production builds from /dist');
  } else {
    // Vite middleware mode for local development
    console.log('⚡ Starting Vite in dev middleware mode...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 Expense Tracker running at http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
