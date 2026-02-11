import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

const Calculator = () => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const handleNumber = (num) => {
        setDisplay(display === '0' ? num : display + num);
    };

    const handleOperator = (op) => {
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const handleEqual = () => {
        try {
            // eslint-disable-next-line no-eval
            const result = eval(equation + display);
            setDisplay(String(result));
            setEquation('');
        } catch (error) {
            setDisplay('Error');
            setEquation('');
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
    };

    const buttons = [
        '7', '8', '9', '/',
        '4', '5', '6', '*',
        '1', '2', '3', '-',
        'C', '0', '=', '+'
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center pb-20 pt-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-6 rounded-[2.5rem] shadow-2xl w-full max-w-sm transition-all duration-300"
            >
                {/* Display */}
                <div className="bg-gray-50 dark:bg-gray-900/80 rounded-3xl p-6 mb-6 text-right shadow-inner border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="text-gray-400 dark:text-gray-500 text-sm h-6 font-medium">{equation}</div>
                    <div className="text-5xl font-mono text-gray-900 dark:text-white overflow-hidden text-ellipsis font-bold">{display}</div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-4 gap-3">
                    {buttons.map((btn) => (
                        <Button
                            key={btn}
                            onClick={() => {
                                if (btn === 'C') handleClear();
                                else if (btn === '=') handleEqual();
                                else if (['+', '-', '*', '/'].includes(btn)) handleOperator(btn);
                                else handleNumber(btn);
                            }}
                            variant={
                                btn === '=' ? 'primary' :
                                    btn === 'C' ? 'secondary' :
                                        ['+', '-', '*', '/'].includes(btn) ? 'outline' : 'secondary'
                            }
                            className={`h-16 text-2xl font-black rounded-2xl transition-all ${btn === 'C' ? 'bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500/20' : ''
                                }`}
                        >
                            {btn}
                        </Button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Calculator;
