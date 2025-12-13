import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const ALLOWED_EMAILS = ['rafaelmontes92@outlook.com', 'angelica.sfm@hotmail.com'];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // 1. Strict Email Whitelist Check
        if (!ALLOWED_EMAILS.includes(email.trim().toLowerCase())) {
            setError('Access Denied: This email is not authorized to access Angel Fit.');
            setLoading(false);
            return;
        }

        try {
            // Login Logic
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if (error) throw error;
            if (data.user) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
            <div className="w-full max-w-md p-8 bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700">
                <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                    Angel Fit Login
                </h1>

                {message && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg text-sm text-center">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-white placeholder-neutral-600"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-white placeholder-neutral-600"
                            placeholder="Enter your password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
