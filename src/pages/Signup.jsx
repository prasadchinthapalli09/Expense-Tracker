import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { motion } from 'framer-motion';
import Input from '../components/Input';
import Button from '../components/Button';
import { GoogleLogin } from '@react-oauth/google';
import { countries } from '../utils/countries';
import { User, Mail, Lock, Phone, MapPin, Globe, Wallet } from 'lucide-react';

const Signup = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        email: '',
        password: '',
        mobile: '',
        country: '',
        currency_symbol: '$',
        googleId: ''
    });

    useEffect(() => {
        if (location.state) {
            const { name, email, googleId } = location.state;
            setFormData(prev => ({
                ...prev,
                name: name || prev.name,
                email: email || prev.email,
                googleId: googleId || prev.googleId,
                nickname: name ? name.split(' ')[0] : prev.nickname
            }));
        }
    }, [location.state]);

    const [searchTerm, setSearchTerm] = useState('');
    const [showCountries, setShowCountries] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCountrySelect = (country) => {
        setFormData({ ...formData, country: country.name, currency_symbol: country.currency });
        setSearchTerm(country.name);
        setShowCountries(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
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
            await googleLogin(credentialResponse.credential);
            navigate('/');
        } catch (err) {
            setError('Google Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Signup failed');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 font-sans transition-colors duration-300 relative overflow-hidden">
            {/* Background gradient blobs for aesthetic */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-6 rounded-[2.5rem] shadow-2xl w-full max-w-2xl z-10 relative transition-all duration-300"
            >
                {/* Logo Section */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center mb-6"
                >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 transform rotate-6">
                        <Wallet className="text-white" size={28} />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        Expense<span className="text-blue-600 dark:text-blue-400">Tracker</span>
                    </h1>
                </motion.div>

                <h2 className="text-3xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">Create Account</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2 rounded-lg mb-4 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    {/* Left Column */}
                    <div className="space-y-2">
                        <Input
                            icon={User}
                            label="Full Name"
                            type="text"
                            placeHolder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            icon={User}
                            label="Nickname"
                            type="text"
                            placeHolder="Johnny"
                            value={formData.nickname}
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                            required
                        />
                        <Input
                            icon={Mail}
                            label="Email Address"
                            type="email"
                            placeHolder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={!!formData.googleId}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                        {/* Country Selection */}
                        <div className="relative mb-2">
                            <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">Country</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Globe className="text-gray-400 dark:text-gray-500" size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search Country..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowCountries(true);
                                    }}
                                    onFocus={() => setShowCountries(true)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 px-4 focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-sm dark:shadow-none min-h-[50px]"
                                    required
                                />
                                {showCountries && searchTerm && (
                                    <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-2xl">
                                        {filteredCountries.length > 0 ? (
                                            filteredCountries.map((c) => (
                                                <div
                                                    key={c.code}
                                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors text-sm"
                                                    onClick={() => handleCountrySelect(c)}
                                                >
                                                    <span className="text-gray-900 dark:text-white font-medium">{c.name}</span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{c.currency}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-gray-500 dark:text-gray-400 text-xs italic">No countries found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Input
                            icon={Phone}
                            label="Mobile Number (Optional)"
                            type="tel"
                            placeHolder="+1 234 567 890"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        />
                        <Input
                            icon={Lock}
                            label="Password"
                            type="password"
                            placeHolder={formData.googleId ? "Set a password (optional)" : "Create a password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!formData.googleId}
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-3">
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </div>
                </form>

                <div className="my-4 flex items-center gap-4 text-gray-400">
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-800"></div>
                    <span className="text-xs font-bold uppercase tracking-wider">or</span>
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-800"></div>
                </div>

                <div className="flex justify-center">
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

                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underlineTransition-colors">
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
