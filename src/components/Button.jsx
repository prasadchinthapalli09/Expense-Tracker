import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '' }) => {
    const baseStyle = "w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95";
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20",
        secondary: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200",
        outline: "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400",
        google: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
};

export default Button;
