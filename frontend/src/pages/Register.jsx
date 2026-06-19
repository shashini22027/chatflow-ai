import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await registerUser(name, email, password);
            navigate('/');
        } catch (err) {
            console.error('Registration failed', err);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-surface border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
                <h2 className="text-3xl font-bold text-textMain mb-2 text-center">Create Account</h2>
                <p className="text-textMuted mb-8 text-center">Join NeuroChat AI today</p>
                
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                            className="w-full bg-background border border-gray-700 text-textMain rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                            className="w-full bg-background border border-gray-700 text-textMain rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                            className="w-full bg-background border border-gray-700 text-textMain rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-3 transition-colors shadow-lg shadow-blue-500/30">
                        Sign Up
                    </button>
                </form>

                <p className="mt-8 text-center text-textMuted">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
