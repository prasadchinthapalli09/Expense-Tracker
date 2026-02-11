import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const Overview = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

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

    // Calculations
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    // Data for Charts
    const pieData = [
        { name: 'Income', value: totalIncome },
        { name: 'Expense', value: totalExpense },
    ];

    const COLORS = ['#10B981', '#EF4444']; // Green for Income, Red for Expense

    const isDark = theme === 'dark';

    return (
        <div className="h-full overflow-y-auto pb-20 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass p-6 rounded-3xl shadow-lg flex items-center justify-between transition-all duration-300"
                >
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Balance</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400">
                        <Wallet size={24} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass p-6 rounded-3xl shadow-lg flex items-center justify-between transition-all duration-300"
                >
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Income</p>
                        <h3 className="text-2xl font-black text-green-600 dark:text-green-500 mt-1">
                            +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="p-4 bg-green-500/10 dark:bg-green-500/20 rounded-2xl text-green-600 dark:text-green-500">
                        <TrendingUp size={24} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass p-6 rounded-3xl shadow-lg flex items-center justify-between transition-all duration-300"
                >
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Expense</p>
                        <h3 className="text-2xl font-black text-red-600 dark:text-red-500 mt-1">
                            -${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="p-4 bg-red-500/10 dark:bg-red-500/20 rounded-2xl text-red-600 dark:text-red-500">
                        <TrendingDown size={24} />
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                    className="glass p-6 rounded-3xl shadow-lg min-h-[350px] transition-all duration-300"
                >
                    <h4 className="text-lg font-bold mb-6 text-gray-800 dark:text-gray-200">Income vs Expense</h4>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                        borderColor: isDark ? '#374151' : '#E5E7EB',
                                        color: isDark ? '#fff' : '#111827',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: isDark ? '#fff' : '#111827' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                    className="glass p-6 rounded-3xl shadow-lg min-h-[350px] flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-300 border-dashed"
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="text-gray-400" size={30} />
                        </div>
                        <p className="font-medium">More detailed analysis coming soon...</p>
                        <p className="text-xs mt-1">We are working on weekly and monthly trends.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Overview;
