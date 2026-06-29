// ===== server/controllers/transactionController.js =====
import { TransactionModel } from '../models/Transaction.js';
import { UserModel } from '../models/User.js';

export async function getTransactions(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User unauthorized' });
    }

    const { type, category, startDate, endDate } = req.query;

    const filter = { userId };
    if (type) {
      filter.type = type;
    }
    if (category) {
      filter.category = category;
    }
    if (startDate) {
      filter.startDate = new Date(startDate);
    }
    if (endDate) {
      filter.endDate = new Date(endDate);
    }

    const transactions = await TransactionModel.find(filter);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Server error while fetching transactions' });
  }
}

export async function createTransaction(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User unauthorized' });
    }

    const { title, amount, type, category, date, notes } = req.body;

    if (!title || amount === undefined || !type || !category || !date) {
      return res.status(400).json({ error: 'Please provide all required fields: title, amount, type, category, date' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    const newTx = await TransactionModel.create({
      userId,
      title,
      amount: Number(amount),
      type,
      category,
      date: new Date(date),
      notes: notes || '',
    });

    return res.status(201).json(newTx);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ error: 'Server error while creating transaction' });
  }
}

export async function updateTransaction(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User unauthorized' });
    }

    const transaction = await TransactionModel.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Security check: ensure transaction belongs to user
    if (transaction.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this transaction.' });
    }

    const updatedTx = await TransactionModel.findByIdAndUpdate(id, req.body);
    return res.status(200).json(updatedTx);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return res.status(500).json({ error: 'Server error while updating transaction' });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User unauthorized' });
    }

    const transaction = await TransactionModel.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Security check
    if (transaction.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this transaction.' });
    }

    await TransactionModel.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ error: 'Server error while deleting transaction' });
  }
}

export async function getTransactionSummary(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User unauthorized' });
    }

    // Fetch all user transactions to compute totals
    const allTxs = await TransactionModel.find({ userId });

    let totalIncome = 0;
    let totalExpenses = 0;

    allTxs.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    });

    const balance = totalIncome - totalExpenses;
    const recentTransactions = allTxs.slice(0, 5); // Already sorted desc by find

    return res.status(200).json({
      totalIncome,
      totalExpenses,
      balance,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error compiling transaction summary:', error);
    return res.status(500).json({ error: 'Server error while generating dashboard summary' });
  }
}

export async function getTransactionAnalytics(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User unauthorized' });
    }

    const allTxs = await TransactionModel.find({ userId });

    // Category breakdown (for expenses)
    const categoryMap = {};
    allTxs.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const categoryBreakdown = Object.keys(categoryMap).map(category => ({
      category,
      total: categoryMap[category],
    }));

    // Generate monthly groups for last 6 months
    const monthlyTrend = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrend.push({
        month: monthLabel,
        income: 0,
        expense: 0,
        monthKey,
        yearVal: d.getFullYear(),
        monthVal: d.getMonth()
      });
    }

    // Populate monthly groups
    allTxs.forEach(t => {
      const tDate = new Date(t.date);
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth();

      const matchedMonth = monthlyTrend.find(m => m.yearVal === tYear && m.monthVal === tMonth);
      if (matchedMonth) {
        if (t.type === 'income') {
          matchedMonth.income += t.amount;
        } else {
          matchedMonth.expense += t.amount;
        }
      }
    });

    const cleanMonthlyTrend = monthlyTrend.map(({ month, income, expense }) => ({
      month,
      income,
      expense
    }));

    const monthlySpend = monthlyTrend.map(({ month, expense }) => ({
      month,
      total: expense
    }));

    return res.status(200).json({
      categoryBreakdown,
      monthlyTrend: cleanMonthlyTrend,
      monthlySpend
    });
  } catch (error) {
    console.error('Error compiling transaction analytics:', error);
    return res.status(500).json({ error: 'Server error while generating analytics graphs' });
  }
}

// Budget management controllers
export async function getBudgets(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User unauthorized' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ budgets: user.budgets || {} });
  } catch (error) {
    console.error('Error getting budgets:', error);
    return res.status(500).json({ error: 'Server error while getting budgets' });
  }
}

export async function updateBudgets(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User unauthorized' });
    }

    const { budgets } = req.body;
    if (!budgets || typeof budgets !== 'object') {
      return res.status(400).json({ error: 'Invalid budgets payload. Must be an object.' });
    }

    const updatedUser = await UserModel.updateBudgets(userId, budgets);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ success: true, budgets: updatedUser.budgets || {} });
  } catch (error) {
    console.error('Error updating budgets:', error);
    return res.status(500).json({ error: 'Server error while updating budgets' });
  }
}
