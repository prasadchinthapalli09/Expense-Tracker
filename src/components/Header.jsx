import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, PlusCircle, PieChart, List, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EditProfileModal from './EditProfileModal';

const Header = ({ activeSection, onSectionChange, user }) => {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const navItems = [
        { id: 'add', label: 'Add', icon: PlusCircle },
        { id: 'overview', label: 'Overview', icon: PieChart },
        { id: 'manage', label: 'Manage', icon: List },
        { id: 'calculator', label: 'Calc', icon: Calculator },
    ];

    return (
        <>
            <header className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo / Title */}
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                            Expense Tracker
                        </h1>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Welcome, {user?.name || user?.email?.split('@')[0] || 'User'}
                        </span>
                    </div>

                    {/* Navigation - Sliding Indicator */}
                    <nav className="hidden md:flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 relative transition-colors duration-300">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onSectionChange(item.id)}
                                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors z-10 flex items-center gap-2 ${activeSection === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                {activeSection === item.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-600 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1">
                                    <item.icon size={16} />
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </nav>

                    {/* Mobile Nav items (Icons only) */}
                    <nav className="flex md:hidden gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1 scrollbar-hide overflow-x-auto max-w-[40%] transition-colors duration-300">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onSectionChange(item.id)}
                                className={`p-2 rounded-full transition-colors ${activeSection === item.id ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                <item.icon size={18} />
                            </button>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2">

                        {/* Profile Actions */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                            >
                                {user?.name ? (
                                    <span className="font-bold text-sm text-gray-700 dark:text-gray-200">{user.name.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <UserIcon size={20} className="text-gray-500 dark:text-gray-300" />
                                )}
                            </button>

                            {/* Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(true);
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                    >
                                        <UserIcon size={16} /> Edit Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/login');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />
        </>
    );
};

export default Header;
