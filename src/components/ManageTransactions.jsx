import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Search, Calendar, Filter, Edit2, X, Download, FileText } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import EditTransactionModal from './EditTransactionModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const ManageTransactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const categories = [
        'All',
        'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Salary', 'Freelance', 'Business', 'Investments', 'Gifts', 'Other'
    ];

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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;

        try {
            await api.delete(`/transactions/${id}`);
            setTransactions(transactions.filter(t => t._id !== id));
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete');
        }
    };

    const handleEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === 'All' || t.category === filterCategory;

        const transDate = new Date(t.date);
        const matchesStartDate = !startDate || transDate >= new Date(startDate);
        const matchesEndDate = !endDate || transDate <= new Date(endDate);

        return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
    });

    const resetFilters = () => {
        setSearchTerm('');
        setFilterCategory('All');
        setStartDate('');
        setEndDate('');
    };

    const exportToCSV = () => {
        const headers = ['Date,Type,Category,Amount,Description\n'];
        const rows = filteredTransactions.map(t => {
            return `${new Date(t.date).toLocaleDateString()},${t.type},${t.category},${t.amount},"${t.description || ''}"\n`;
        });

        const csvContent = headers.concat(rows).join('');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV Downloaded');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Expense Tracker Report', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["Date", "Type", "Category", "Amount", "Description"];
        const tableRows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type.toUpperCase(),
            t.category,
            `$${t.amount.toLocaleString()}`,
            t.description || '-'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'striped',
            headStyles: { fillGray: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillGray: [245, 245, 245] }
        });

        doc.save(`report_${new Date().toLocaleDateString()}.pdf`);
        toast.success('PDF Downloaded');
    };

    return (
        <div className="h-full overflow-y-auto pb-20 pt-4">
            {/* Search and Filters */}
            <div className="glass p-5 rounded-3xl mb-8 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-gray-400 dark:text-gray-500" size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-9 px-4 focus:outline-none focus:border-blue-500 transition-all text-sm shadow-sm dark:shadow-none"
                        />
                    </div>

                    {/* Category */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="text-gray-400 dark:text-gray-500" size={16} />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-9 px-4 focus:outline-none focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer shadow-sm dark:shadow-none"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat} className="bg-white dark:bg-gray-800">{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                        </div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-9 px-4 focus:outline-none focus:border-blue-500 transition-all text-sm shadow-sm dark:shadow-none"
                        />
                    </div>

                    {/* End Date */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                        </div>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-9 px-4 focus:outline-none focus:border-blue-500 transition-all text-sm shadow-sm dark:shadow-none"
                        />
                    </div>
                </div>

                {(searchTerm || filterCategory !== 'All' || startDate || endDate) && (
                    <button
                        onClick={resetFilters}
                        className="mt-4 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-1 transition-colors font-medium"
                    >
                        <X size={12} /> Reset Filters
                    </button>
                )}
            </div>

            {/* Export Actions */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">History</h3>
                <div className="flex gap-2">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                        <Download size={14} /> CSV
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <FileText size={14} /> PDF Report
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 mt-10">Loading transactions...</div>
            ) : filteredTransactions.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">No transactions found.</div>
            ) : (
                <div className="space-y-3 pb-8">
                    <AnimatePresence>
                        {filteredTransactions.map((t) => (
                            <motion.div
                                key={t._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                layout
                                className="bg-white dark:bg-gray-800/60 p-4 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg flex items-center justify-between group hover:border-blue-500/50 transition-all backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${t.type === 'income' ? 'bg-green-500/10 text-green-600 dark:text-green-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                                        {t.type === 'income' ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{t.category}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            <Calendar size={12} />
                                            <span>{new Date(t.date).toLocaleDateString()}</span>
                                            {t.description && <span className="truncate max-w-[150px] border-l border-gray-300 dark:border-gray-600 pl-2 ml-1 hidden sm:inline">{t.description}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <span className={`font-black text-xl ${t.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(t)}
                                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            aria-label="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(t._id)}
                                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            aria-label="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                transaction={selectedTransaction}
                onUpdate={fetchTransactions}
            />
        </div>
    );
};

export default ManageTransactions;

