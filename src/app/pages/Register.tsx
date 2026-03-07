import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { UserPlus, Phone, Lock, User, Users, GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';

const roleOptions = [
    { value: 'STUDENT', label: 'Student', icon: '🎓', desc: 'I want to learn' },
    { value: 'PARENT', label: 'Parent', icon: '👨‍👩‍👧', desc: 'Monitor my child' },
    { value: 'TEACHER', label: 'Teacher', icon: '📚', desc: 'I want to teach' },
];

export function Register() {
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        password: '',
        role: 'STUDENT',
    });
    const [showPassword, setShowPassword] = useState(false);
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
            navigate('/courses');
        } catch (err: any) {
            setError(err.response?.data || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-blue-100 overflow-hidden">
                    {/* Top banner */}
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 pt-8 pb-12 text-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-1">Join KidsLearn!</h1>
                        <p className="text-white/80 text-sm">Create your free account today</p>
                    </div>

                    <div className="px-8 pb-8 -mt-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all text-sm placeholder-gray-400"
                                            placeholder="e.g. Alex Johnson"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            required
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all text-sm placeholder-gray-400"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-12 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all text-sm placeholder-gray-400"
                                            placeholder="Create a strong password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Role Selector - visual cards */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">I am a...</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {roleOptions.map((r) => (
                                            <button
                                                key={r.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: r.value })}
                                                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${formData.role === r.value
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-blue-50/40'
                                                    }`}
                                            >
                                                <span className="text-xl">{r.icon}</span>
                                                <span>{r.label}</span>
                                                <span className="text-[10px] opacity-70 font-normal">{r.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 text-base font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Creating account...
                                        </span>
                                    ) : 'Create Account →'}
                                </Button>
                            </form>
                        </div>

                        <p className="mt-5 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 font-bold hover:text-purple-600 transition-colors">
                                Log in here →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
