import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { LogIn } from 'lucide-react';

export function Login() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ phoneNumber, password });
            navigate('/courses'); // Redirect to courses after login
        } catch (err: any) {
            setError(err.response?.data || 'Failed to login. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-4 border-purple-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">Welcome Back!</h2>
                <p className="text-gray-600 mb-8">Ready to learn something new?</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-purple-100 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
                            placeholder="Enter your phone number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-purple-100 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
                            placeholder="Enter your password"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-6 text-lg font-bold hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </Button>
                </form>

                <p className="mt-6 text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-600 font-bold hover:underline">
                        Sign up here
                    </Link>
                </p>
            </div>
        </div>
    );
}
