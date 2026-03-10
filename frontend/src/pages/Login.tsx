import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiFetch } from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      login(data.token, data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      navigate(redirect ? `/${redirect}` : (data.user.role === 'admin' ? '/admin' : '/'));
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-cream-50 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-brand-50"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500">
            {isLogin ? 'Sign in to continue your fashion journey' : 'Join Lily Boutique for exclusive styles'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Full Name"
                required
                className="w-full pl-12 pr-4 py-4 bg-brand-50/30 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              required
              className="w-full pl-12 pr-4 py-4 bg-brand-50/30 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              required
              className="w-full pl-12 pr-4 py-4 bg-brand-50/30 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center"
          >
            {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight className="ml-2" size={20} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-600 font-bold hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
