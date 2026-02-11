import { motion } from 'framer-motion';

const Input = ({ label, type, placeHolder, value, onChange, required, icon: Icon, disabled }) => {
    return (
        <div className="mb-4">
            {label && <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">{label}</label>}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="text-gray-400 dark:text-gray-500" size={18} />
                    </div>
                )}
                <motion.input
                    whileFocus={!disabled ? { scale: 1.01 } : {}}
                    type={type}
                    placeholder={placeHolder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    className={`w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-3 ${Icon ? 'pl-10' : 'px-4'} focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-sm dark:shadow-none ${disabled ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : ''}`}
                />
            </div>
        </div>
    );
};

export default Input;
