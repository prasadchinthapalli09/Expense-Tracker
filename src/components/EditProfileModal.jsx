import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from './Input';
import Button from './Button';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const { updateProfile, deleteAccount } = useAuth();
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [currency, setCurrency] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            setName(user.name || '');
            setMobile(user.mobile || '');
            setCurrency(user.currency_symbol || '$');
            setShowDeleteConfirm(false);
        }
    }, [user, isOpen]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile({
                name,
                mobile,
                currency_symbol: currency
            });

            onClose();
            alert('Profile updated successfully!');
            if (onUpdate) onUpdate();

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you absolutely sure? This will delete your account and ALL your transaction data permanently.')) {
            setLoading(true);
            try {
                await deleteAccount();
                onClose();
            } catch (error) {
                console.error('Error deleting account:', error);
                const message = error.response?.data?.message || error.message || 'Failed to delete account';
                alert(`Failed to delete account: ${message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden transition-all duration-300"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Edit Profile</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <Input
                            icon={User}
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            icon={Phone}
                            label="Mobile Number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                        />
                        <Input
                            icon={DollarSign}
                            label="Currency Symbol"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            placeHolder={user?.currency_symbol || '$'}
                        />

                        <div className="pt-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Danger Zone</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl border-2 border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EditProfileModal;
