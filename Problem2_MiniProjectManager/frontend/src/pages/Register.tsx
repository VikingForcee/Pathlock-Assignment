import { useState } from 'react';
import apiClient from '../api/apiClient';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register', { email, password });
      alert('Registration successful! You can now login.');
      window.location.href = '/login';
    } catch (err: any) {
      alert(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 dark:bg-indigo-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">Start managing your projects today</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-gray-400 font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}