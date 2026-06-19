import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login, guestLogin } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    const handleGuest = async () => {
        try {
            await guestLogin();
            navigate('/');
        } catch (err) {
            console.error('Guest login failed', err);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-surface border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
                <h2 className="text-3xl font-bold text-textMain mb-2 text-center">Welcome Back</h2>
                <p className="text-textMuted mb-8 text-center">Sign in to NeuroChat AI</p>
                
                <form onSubmit={handleLogin} className="space-y-6">
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
                        Sign In
                    </button>
                </form>

                <div className="mt-6">
                    <button onClick={handleGuest} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg px-4 py-3 transition-colors">
                        Continue as Guest
                    </button>
                </div>

                <p className="mt-8 text-center text-textMuted">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
