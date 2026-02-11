import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Tag, FileText, PlusCircle, MinusCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Input from './Input';
import Button from './Button';

const AddTransaction = () => {
    const { user } = useAuth();
    const [type, setType] = useState('expense'); // 'expense' or 'income'
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const expenseCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investments', 'Gifts', 'Other'];

    const categories = type === 'expense' ? expenseCategories : incomeCategories;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/transactions', {
                type,
                amount: parseFloat(amount),
                category,
                description,
                date
            });

            setMessage({ type: 'success', text: 'Transaction added successfully!' });
            // Reset form
            setAmount('');
            setCategory('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (err) {
            console.error('Error adding transaction:', err);
            setMessage({ type: 'error', text: err.response?.data?.message || err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-start pt-4 h-full overflow-y-auto pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-3xl shadow-xl w-full max-w-lg transition-all duration-300"
            >
                <div className="flex gap-4 mb-6 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl transition-colors">
                    <button
                        onClick={() => setType('expense')}
                        className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${type === 'expense'
                            ? 'bg-red-500/20 text-red-600 dark:text-red-500 shadow-lg shadow-red-500/10'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        <MinusCircle size={18} /> Expense
                    </button>
                    <button
                        onClick={() => setType('income')}
                        className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${type === 'income'
                            ? 'bg-green-500/20 text-green-600 dark:text-green-500 shadow-lg shadow-green-500/10'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        <PlusCircle size={18} /> Income
                    </button>
                </div>

                {message.text && (
                    <div className={`p-3 rounded-lg mb-4 text-center text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        icon={DollarSign}
                        type="number"
                        placeHolder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    {/* Category Dropdown */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag className="text-gray-400 dark:text-gray-500" size={18} />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 px-4 appearance-none focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm dark:shadow-none"
                        >
                            <option value="" disabled className="text-gray-400">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{cat}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        icon={Calendar}
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                            <FileText className="text-gray-400 dark:text-gray-500" size={18} />
                        </div>
                        <textarea
                            placeholder="Description (Optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 px-4 focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500 min-h-[100px] resize-none shadow-sm dark:shadow-none"
                        />
                    </div>

                    <Button
                        type="submit"
                        className={type === 'expense' ? 'bg-red-600 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 shadow-red-600/20' : 'bg-green-600 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-500 shadow-green-600/20'}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default AddTransaction;
