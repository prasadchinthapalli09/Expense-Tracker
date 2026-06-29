// ===== server/routes/transactionRoutes.js =====
import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getTransactionAnalytics,
  getBudgets,
  updateBudgets
} from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Secure all transaction routes with JWT authentication
router.use(authMiddleware);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/summary', getTransactionSummary);
router.get('/analytics', getTransactionAnalytics);
router.get('/budgets', getBudgets);
router.post('/budgets', updateBudgets);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
