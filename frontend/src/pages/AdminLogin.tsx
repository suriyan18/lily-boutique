import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiFetch } from '../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      login(data.token, data.user);
      toast.success('Admin access granted.');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-900 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center border-2 border-brand-500">
              <Shield className="text-brand-500" size={32} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-400 text-sm">
            Restricted access. Authorized personnel only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="email" 
              placeholder="Admin Email/User ID"
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-white transition-all placeholder-gray-600"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="password" 
              placeholder="Admin Password"
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-white transition-all placeholder-gray-600"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center"
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'} <ArrowRight className="ml-2" size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
