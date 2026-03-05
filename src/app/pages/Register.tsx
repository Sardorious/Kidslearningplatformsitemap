import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { UserPlus } from 'lucide-react';

export function Register() {
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        password: '',
        role: 'STUDENT', // Default to STUDENT
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/courses'); // Redirect to courses after register
        } catch (err: any) {
            setError(err.response?.data || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-4 border-blue-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">Join KidsLearn!</h2>
                <p className="text-gray-600 mb-8">Create an account to start your journey.</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="e.g. Alex Johnson"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            required
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="Enter phone number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                            placeholder="Create a password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 transition-colors bg-white"
                        >
                            <option value="STUDENT">Student</option>
                            <option value="PARENT">Parent</option>
                            <option value="TEACHER">Teacher</option>
                        </select>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl py-6 text-lg font-bold hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="mt-6 text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
