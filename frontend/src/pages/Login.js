import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/token/', { username, password });
      
      // Defensive data extraction with nullish coalescing
      const accessToken = res?.data?.access ?? null;
      const refreshToken = res?.data?.refresh ?? null;
      
      if (!accessToken || !refreshToken) {
        throw new Error('Invalid response: missing tokens');
      }

      try {
        localStorage?.setItem?.('access_token', accessToken);
        localStorage?.setItem?.('refresh_token', refreshToken);
      } catch (storageErr) {
        console.error('[Login] Storage error:', storageErr);
        throw new Error('Failed to save authentication. Please check browser storage permissions.');
      }
      
      // Safely decode JWT
      try {
        const parts = accessToken?.split?.('.') ?? [];
        const base64Url = parts[1] ?? '';
        if (!base64Url) throw new Error('Invalid token format');
        
        const payload = JSON.parse(atob(base64Url));
        const role = payload?.role ?? null;
        
        if (role === 'STUDENT') {
          navigate('/student', { replace: true });
        } else if (role === 'CARETAKER') {
          navigate('/caretaker', { replace: true });
        } else if (role === 'LANDLORD') {
          navigate('/landlord', { replace: true });
        } else {
          throw new Error(`Unknown role: ${role}`);
        }
      } catch (jwtErr) {
        console.error('[Login] JWT decode error:', jwtErr);
        setError('Failed to decode authentication token. Please try again.');
      }
    } catch (error) {
      const errorMessage = 
        error?.response?.data?.detail ??
        error?.message ??
        'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">BoardPay</h1>
          <p className="text-gray-400 text-sm">Hybrid Boarding House Ledger</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input w-full"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cyan w-full font-semibold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
