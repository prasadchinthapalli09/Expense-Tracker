import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Tag, FileText, PlusCircle, MinusCircle } from 'lucide-react';
import api from '../utils/api';
import Input from './Input';
import Button from './Button';

const EditTransactionModal = ({ isOpen, onClose, transaction, onUpdate }) => {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const expenseCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investments', 'Gifts', 'Other'];

    const categories = type === 'expense' ? expenseCategories : incomeCategories;

    useEffect(() => {
        if (transaction && isOpen) {
            setType(transaction.type);
            setAmount(transaction.amount.toString());
            setCategory(transaction.category);
            setDate(new Date(transaction.date).toISOString().split('T')[0]);
            setDescription(transaction.description || '');
            setError('');
        }
    }, [transaction, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.put(`/transactions/${transaction._id}`, {
                type,
                amount: parseFloat(amount),
                category,
                description,
                date
            });

            onUpdate();
            onClose();
        } catch (err) {
            console.error('Error updating transaction:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transition-all duration-300"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Transaction</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
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

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 p-3 rounded-lg mb-4 text-center text-sm">
                            {error}
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
                                    <option key={cat} value={cat} className="bg-white dark:bg-gray-800">{cat}</option>
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

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? 'Saving...' : 'Update'}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default EditTransactionModal;
