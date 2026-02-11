import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, Lock, LogIn, Wallet } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const data = await googleLogin(credentialResponse.credential);
            if (data.isNew) {
                navigate('/signup', { state: data.googleData });
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Google Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Login failed');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-[2.5rem] shadow-2xl w-full max-w-md transition-all duration-300"
            >
                {/* Logo Section */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center mb-6"
                >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 transform -rotate-6">
                        <Wallet className="text-white" size={28} />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        Expense<span className="text-blue-600 dark:text-blue-400">Tracker</span>
                    </h1>
                </motion.div>

                <h2 className="text-3xl font-black text-center mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                    Welcome Back
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm">
                    Enter your details to manage your expenses
                </p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-4 text-center font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handlePasswordLogin} className="space-y-3">
                    <Input
                        icon={Mail}
                        label="Email Address"
                        type="email"
                        placeHolder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        icon={Lock}
                        label="Password"
                        type="password"
                        placeHolder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-4 pb-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-center relative">
                    <span className="bg-white dark:bg-gray-900/0 px-4 text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10 glass rounded-full py-1">
                        Or continue with
                    </span>
                </div>

                <div className="mt-4 flex justify-center">
                    <div className="w-full max-w-[240px]">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_blue"
                            shape="pill"
                            width="240"
                        />
                    </div>
                </div>

                <p className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
