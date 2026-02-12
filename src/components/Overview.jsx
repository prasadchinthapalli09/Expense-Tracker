import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, TrendingDown, Wallet, Clock, ArrowRight, Settings, X, Target, BarChart3, Star, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const Overview = () => {
    const { user, updateProfile } = useAuth();
    const { theme } = useTheme();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 2000);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [tempBudget, setTempBudget] = useState(user?.monthlyBudget || 2000);
    const [savingsGoal, setSavingsGoal] = useState(user?.savingsGoal || 0);
    const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
    const [tempSavings, setTempSavings] = useState(user?.savingsGoal || 0);
    const [monthlySavingsLimit, setMonthlySavingsLimit] = useState(user?.monthlySavingsLimit || 0);
    const [isSavingsLimitModalOpen, setIsSavingsLimitModalOpen] = useState(false);
    const [tempSavingsLimit, setTempSavingsLimit] = useState(user?.monthlySavingsLimit || 0);
    const [alertThresholds, setAlertThresholds] = useState({ 80: false, 90: false, 100: false });
    const [savingsAlertThresholds, setSavingsAlertThresholds] = useState({ 80: false, 90: false, 100: false });

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        if (user?.monthlyBudget) {
            setMonthlyBudget(user.monthlyBudget);
            setTempBudget(user.monthlyBudget);
        }
        if (user?.savingsGoal) {
            setSavingsGoal(user.savingsGoal);
            setTempSavings(user.savingsGoal);
        }
        if (user?.monthlySavingsLimit) {
            setMonthlySavingsLimit(user.monthlySavingsLimit);
            setTempSavingsLimit(user.monthlySavingsLimit);
        }
    }, [user]);

    useEffect(() => {
        checkBudgetAlerts();
    }, [transactions, monthlyBudget, monthlySavingsLimit]);

    const checkBudgetAlerts = () => {
        const newAlerts = { ...alertThresholds };
        const newSavingsAlerts = { ...savingsAlertThresholds };
        let alerted = false;

        // 1. Standard Budget Alerts
        if (monthlyBudget > 0) {
            const percentage = (currentMonthExpenses / monthlyBudget) * 100;
            [100, 90, 80].forEach(threshold => {
                if (percentage >= threshold && !alertThresholds[threshold]) {
                    toast(`⚠️ Budget Alert: You've used ${threshold}% of your limit!`, {
                        icon: '🔔',
                        style: { borderRadius: '15px', background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
                    });
                    newAlerts[threshold] = true;
                    alerted = true;
                } else if (percentage < threshold) {
                    newAlerts[threshold] = false;
                }
            });
        }

        // 2. Monthly Savings Limit Alerts (Income - Savings Target)
        if (monthlySavingsLimit > 0 && currentMonthIncome > 0) {
            const safeSpendLimit = currentMonthIncome - monthlySavingsLimit;
            if (safeSpendLimit > 0) {
                const percentage = (currentMonthExpenses / safeSpendLimit) * 100;
                [100, 90, 80].forEach(threshold => {
                    if (percentage >= threshold && !savingsAlertThresholds[threshold]) {
                        toast(`🚨 Savings Protection: Your spending is affecting your ${monthlySavingsLimit} savings goal!`, {
                            icon: '💰',
                            style: { borderRadius: '15px', background: '#1e3a8a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
                        });
                        newSavingsAlerts[threshold] = true;
                        alerted = true;
                    } else if (percentage < threshold) {
                        newSavingsAlerts[threshold] = false;
                    }
                });
            }
        }

        if (alerted) {
            setAlertThresholds(newAlerts);
            setSavingsAlertThresholds(newSavingsAlerts);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions');
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBudget = async () => {
        try {
            await updateProfile({ monthlyBudget: Number(tempBudget) });
            setIsBudgetModalOpen(false);
            toast.success('Budget goal updated');
        } catch (error) {
            console.error('Failed to update budget', error);
        }
    };

    const handleSaveSavings = async () => {
        try {
            await updateProfile({ savingsGoal: Number(tempSavings) });
            setIsSavingsModalOpen(false);
            toast.success('Savings goal set');
        } catch (error) {
            console.error('Failed to update savings goal', error);
        }
    };

    const handleSaveMonthlySavingsLimit = async () => {
        try {
            await updateProfile({ monthlySavingsLimit: Number(tempSavingsLimit) });
            setIsSavingsLimitModalOpen(false);
            toast.success('Monthly savings target updated');
        } catch (error) {
            console.error('Failed to update monthly savings limit', error);
        }
    };

    // Calculations
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    // Category Breakdown for Pie Chart (Expenses only)
    const categoryData = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => {
            const existing = acc.find(item => item.name === curr.category);
            if (existing) {
                existing.value += curr.amount;
            } else {
                acc.push({ name: curr.category, value: curr.amount });
            }
            return acc;
        }, []);

    // Current Month Expenses
    const currentMonthExpenses = transactions
        .filter(t => {
            const tDate = new Date(t.date);
            const now = new Date();
            return t.type === 'expense' && tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        })
        .reduce((acc, curr) => acc + curr.amount, 0);

    // Current Month Income
    const currentMonthIncome = transactions
        .filter(t => {
            const tDate = new Date(t.date);
            const now = new Date();
            return t.type === 'income' && tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        })
        .reduce((acc, curr) => acc + curr.amount, 0);

    const budgetPercentage = Math.min((currentMonthExpenses / (monthlyBudget || 1)) * 100, 100);

    // Monthly Savings calculations
    const monthlySavingsCurrent = currentMonthIncome - currentMonthExpenses;
    const monthlySavingsPercentage = monthlySavingsLimit > 0 ? Math.min((Math.max(0, monthlySavingsCurrent) / monthlySavingsLimit) * 100, 100) : 0;
    const budgetColor = budgetPercentage > 90 ? 'bg-red-500' : budgetPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500';

    // Weekly Trend Data
    const getWeeklyTrend = () => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dayTotal = transactions
                .filter(t => t.type === 'expense' && t.date.split('T')[0] === date)
                .reduce((acc, curr) => acc + curr.amount, 0);

            return {
                date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
                amount: dayTotal
            };
        });
    };

    const weeklyTrendData = getWeeklyTrend();

    // Monthly Comparison Data (Last 6 months)
    const getMonthlyComparison = () => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                name: d.toLocaleString('default', { month: 'short' }),
                month: d.getMonth(),
                year: d.getFullYear(),
                income: 0,
                expense: 0
            });
        }

        months.forEach(m => {
            const income = transactions
                .filter(t => t.type === 'income' && new Date(t.date).getMonth() === m.month && new Date(t.date).getFullYear() === m.year)
                .reduce((acc, curr) => acc + curr.amount, 0);

            const expense = transactions
                .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m.month && new Date(t.date).getFullYear() === m.year)
                .reduce((acc, curr) => acc + curr.amount, 0);

            m.income = income;
            m.expense = expense;
        });

        return months;
    };

    const monthlyComparisonData = getMonthlyComparison();

    const savingsPercentage = savingsGoal > 0 ? Math.min((balance / savingsGoal) * 100, 100) : 0;

    // Recent Activity
    const recentActivity = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const CATEGORY_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];
    const isDark = theme === 'dark';

    return (
        <div className="h-full overflow-y-auto pb-20 pt-4 custom-scrollbar px-4 md:px-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass p-6 rounded-3xl shadow-xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02]"
                >
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Balance</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                            {user?.currency_symbol || '$'}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-3xl text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Wallet size={28} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass p-6 rounded-3xl shadow-xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02]"
                >
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Income</p>
                        <h3 className="text-3xl font-black text-green-600 dark:text-green-500 mt-1">
                            +{user?.currency_symbol || '$'}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="p-4 bg-green-500/10 dark:bg-green-500/20 rounded-3xl text-green-600 dark:text-green-500 border border-green-500/20">
                        <TrendingUp size={28} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass p-6 rounded-3xl shadow-xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02]"
                >
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Expense</p>
                        <h3 className="text-3xl font-black text-red-600 dark:text-red-500 mt-1">
                            -{user?.currency_symbol || '$'}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="p-4 bg-red-500/10 dark:bg-red-500/20 rounded-3xl text-red-600 dark:text-red-500 border border-red-500/20">
                        <TrendingDown size={28} />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Weekly Trend (Spans 2 columns) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-2 glass p-8 rounded-[2rem] shadow-xl min-h-[400px] transition-all duration-300 border border-white/10"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Weekly Spending Trend</h4>
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800/50 px-4 py-2 rounded-xl">
                            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                            Expenses
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyTrendData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#111827' : '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '20px',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                        color: isDark ? '#fff' : '#111827',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3B82F6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Savings Goal Tracker (1 column) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="glass p-8 rounded-[2rem] shadow-xl flex flex-col justify-between transition-all duration-300 border border-white/10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 dark:text-white transition-opacity translate-x-4 -translate-y-4">
                        <Star size={120} />
                    </div>

                    <div className="relative">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Savings Goal</h4>
                            <button
                                onClick={() => setIsSavingsModalOpen(true)}
                                className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all duration-300 shadow-sm border border-white/20"
                            >
                                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>

                        <div className="mb-2 flex justify-between items-end">
                            <span className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Goal Progress</span>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {savingsPercentage.toFixed(0)}%
                            </span>
                        </div>

                        <div className="w-full bg-gray-200/50 dark:bg-gray-800/50 rounded-full h-5 mb-6 overflow-hidden border border-white/10 p-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${savingsPercentage}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            />
                        </div>

                        <div className="bg-gray-100/50 dark:bg-gray-900/30 p-4 rounded-2xl border border-white/5">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
                                {savingsGoal === 0
                                    ? "Set a savings target to begin your wealth building journey."
                                    : balance >= savingsGoal
                                        ? "Congratulations! You've reached your savings goal."
                                        : `You need ${user?.currency_symbol || '$'}${(savingsGoal - balance).toLocaleString()} more to reach your target.`}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Total Savings</span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                                {user?.currency_symbol || '$'}{balance.toLocaleString()}
                                <span className="text-sm text-gray-400 font-medium ml-1">/ {user?.currency_symbol || '$'}{savingsGoal.toLocaleString()}</span>
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Monthly Savings Limit Tracker (1 column) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="glass p-8 rounded-[2rem] shadow-xl flex flex-col justify-between transition-all duration-300 border border-white/10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 dark:text-white transition-opacity translate-x-4 -translate-y-4">
                        <TrendingUp size={120} />
                    </div>

                    <div className="relative">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Monthly Target</h4>
                            <button
                                onClick={() => setIsSavingsLimitModalOpen(true)}
                                className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all duration-300 shadow-sm border border-white/20"
                            >
                                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>

                        <div className="mb-2 flex justify-between items-end">
                            <span className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Progress</span>
                            <span className="text-2xl font-black text-green-600 dark:text-green-400">
                                {monthlySavingsPercentage.toFixed(0)}%
                            </span>
                        </div>

                        <div className="w-full bg-gray-200/50 dark:bg-gray-800/50 rounded-full h-5 mb-6 overflow-hidden border border-white/10 p-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${monthlySavingsPercentage}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-green-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            />
                        </div>

                        <div className="bg-gray-100/50 dark:bg-gray-900/30 p-4 rounded-2xl border border-white/5">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
                                {monthlySavingsLimit === 0
                                    ? "Set a monthly savings target to optimize your budget."
                                    : monthlySavingsCurrent >= monthlySavingsLimit
                                        ? "Great job! You've already hit your monthly savings goal."
                                        : `You need to save ${user?.currency_symbol || '$'}${Math.max(0, monthlySavingsLimit - monthlySavingsCurrent).toLocaleString()} more this month.`}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Current Savings</span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                                {user?.currency_symbol || '$'}{Math.max(0, monthlySavingsCurrent).toLocaleString()}
                                <span className="text-sm text-gray-400 font-medium ml-1">/ {user?.currency_symbol || '$'}{monthlySavingsLimit.toLocaleString()}</span>
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Monthly Comparison Bar Chart */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="glass p-8 rounded-[2rem] shadow-xl min-h-[400px] border border-white/10"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Performance History</h4>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500">
                                <span className="w-2 h-2 rounded-full bg-green-500" /> Income
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                                <span className="w-2 h-2 rounded-full bg-red-500" /> Expense
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, fontWeight: 700 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#4B5563' : '#9CA3AF', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#111827' : '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '20px',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                        padding: '12px 16px'
                                    }}
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                />
                                <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} barSize={20} animationDuration={1500} />
                                <Bar dataKey="expense" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={20} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                    className="glass p-8 rounded-[2rem] shadow-xl min-h-[400px] transition-all duration-300 border border-white/10"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Spending Profile</h4>
                    </div>
                    <div className="h-[280px] w-full">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={200}
                                        animationDuration={1200}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#111827' : '#FFFFFF',
                                            border: 'none',
                                            borderRadius: '20px',
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                            padding: '12px 16px'
                                        }}
                                        itemStyle={{ color: isDark ? '#fff' : '#111827', fontWeight: 'bold' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={48}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="font-bold uppercase tracking-widest text-xs">No active data streams</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
                    className="glass p-8 rounded-[2rem] shadow-xl min-h-[400px] transition-all duration-300 border border-white/10"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Recent Activity</h4>
                        <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((t, i) => (
                                <motion.div
                                    key={t._id || i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + (i * 0.1) }}
                                    className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/80 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-900/60 transition-all duration-300 border border-transparent hover:border-white/20 group cursor-default"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${t.type === 'income' ? 'bg-green-500/10 text-green-600 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-gray-900 dark:text-white leading-none mb-1.5">{t.category}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                {new Date(t.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}{user?.currency_symbol || '$'}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Confirmed</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="font-bold uppercase tracking-widest text-xs">No recent movements</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Budget Settings Modal */}
            <AnimatePresence>
                {isBudgetModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsBudgetModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md glass p-8 rounded-[2.5rem] shadow-2xl border border-white/20"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Set Monthly Goal</h3>
                                <button
                                    onClick={() => setIsBudgetModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Target Amount ({user?.currency_symbol || '$'})</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={tempBudget}
                                            onChange={(e) => setTempBudget(e.target.value)}
                                            className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-xl font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="Enter amount..."
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                            <Target className="text-gray-300 dark:text-gray-600" size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-3xl border border-blue-500/10 space-y-2">
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Growth Tip</p>
                                    <p className="text-xs text-blue-800/60 dark:text-blue-300/60 font-medium leading-relaxed">
                                        Users who set clear monthly targets save 15% more on average by staying conscious of their spending limits.
                                    </p>
                                </div>

                                <button
                                    onClick={handleSaveBudget}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                                >
                                    Confirm Target
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Savings Goal Settings Modal */}
            <AnimatePresence>
                {isSavingsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSavingsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md glass p-8 rounded-[2.5rem] shadow-2xl border border-white/20"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Vault Target</h3>
                                <button
                                    onClick={() => setIsSavingsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Total Goal ({user?.currency_symbol || '$'})</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={tempSavings}
                                            onChange={(e) => setTempSavings(e.target.value)}
                                            className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-xl font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="Enter goal amount..."
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                            <Star className="text-yellow-500/50" size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-3xl border border-yellow-500/10 space-y-2">
                                    <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">Wealth Strategy</p>
                                    <p className="text-xs text-yellow-800/60 dark:text-yellow-300/60 font-medium leading-relaxed">
                                        Setting a specific target helps you stay disciplined. This goal tracks your total lifetime balance against your target.
                                    </p>
                                </div>

                                <button
                                    onClick={handleSaveSavings}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                                >
                                    Set Vault Goal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Monthly Savings Limit Settings Modal */}
            <AnimatePresence>
                {isSavingsLimitModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSavingsLimitModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md glass p-8 rounded-[2.5rem] shadow-2xl border border-white/20"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Monthly Savings Target</h3>
                                <button
                                    onClick={() => setIsSavingsLimitModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Target Savings ({user?.currency_symbol || '$'})</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={tempSavingsLimit}
                                            onChange={(e) => setTempSavingsLimit(e.target.value)}
                                            className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-xl font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="Enter goal amount..."
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                            <TrendingUp className="text-green-500/50" size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-green-500/5 dark:bg-green-500/10 rounded-3xl border border-green-500/10 space-y-2">
                                    <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">Financial Discipline</p>
                                    <p className="text-xs text-green-800/60 dark:text-green-300/60 font-medium leading-relaxed">
                                        This goal protects your income. We will alert you if your expenses exceed the "Safe Zone" (Income - Savings Target).
                                    </p>
                                </div>

                                <button
                                    onClick={handleSaveMonthlySavingsLimit}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                                >
                                    Set Monthly Target
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Overview;
