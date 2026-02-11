import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder Sections
import AddTransaction from '../components/AddTransaction';
import Overview from '../components/Overview';
import ManageTransactions from '../components/ManageTransactions';
import Calculator from '../components/Calculator';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('add');
    const [direction, setDirection] = useState(0);

    const sections = ['add', 'overview', 'manage', 'calculator'];

    const handleSectionChange = (newSection) => {
        const currentIndex = sections.indexOf(activeSection);
        const newIndex = sections.indexOf(newSection);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveSection(newSection);
    };

    const sectionVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden flex flex-col transition-colors duration-300">
            <Header activeSection={activeSection} onSectionChange={handleSectionChange} user={user} />

            <main className="flex-grow relative overflow-hidden container mx-auto px-4 py-6">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={activeSection}
                        custom={direction}
                        variants={sectionVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full h-full"
                    >
                        {activeSection === 'add' && <AddTransaction />}
                        {activeSection === 'overview' && <Overview />}
                        {activeSection === 'manage' && <ManageTransactions />}
                        {activeSection === 'calculator' && <Calculator />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;
