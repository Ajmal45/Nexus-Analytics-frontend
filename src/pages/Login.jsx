import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Loader2, ShieldCheck, TrendingUp, User } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import heroImage from '../assets/hero.png';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { 
          email: formData.email, 
          password: formData.password 
        });
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Welcome back!');
        
        if (data.user.role === 'admin') navigate('/admin/dashboard');
        else if (data.user.role === 'lead') navigate('/lead/dashboard');
        else navigate('/user/dashboard');
        
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match");
          setLoading(false);
          return;
        }

        const { data } = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Account created successfully!');
        
        if (data.user.role === 'lead') navigate('/lead/dashboard');
        else navigate('/user/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)] px-4 py-6 text-[var(--text-primary)]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6%] top-[-14%] h-[24rem] w-[24rem] rounded-full bg-[var(--brand-soft)] blur-[110px]" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[28rem] w-[28rem] rounded-full bg-[var(--accent-soft)] blur-[140px]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between pb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--brand)]">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <ThemeToggle />
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="hidden rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-6 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.45)] lg:block">
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <ShieldCheck size={18} className="text-[var(--brand)]" />
            Secure login for admin and clients
          </div>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-[-0.04em]">Professional lead operations with a cleaner client experience.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
            Sign in to manage lead assignments, collect client requirements, and work from a dashboard designed for real delivery teams.
          </p>
          <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-[var(--border-soft)] bg-[var(--surface)] p-3">
            <img src={heroImage} alt="Nexus Analytics dashboard" className="w-full rounded-[1.2rem] object-cover" />
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-md rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-8 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.55)] backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f4c81] via-[#1d70a2] to-[#2ea38f] shadow-lg shadow-[var(--brand-shadow)]/30">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="mb-2 text-center text-3xl font-bold">Nexus Analytics</h2>
          <p className="mb-8 text-center font-light text-[var(--text-secondary)]">
            {isLogin ? 'Enter your credentials to access your dashboard' : 'Create an account to get started'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
              <div>
                <div className="group relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--brand)]" size={20} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] py-3 pl-12 pr-4 text-[var(--text-primary)] transition-all focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Register As</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[var(--text-primary)] transition-all focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
                >
                  <option value="user">User</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              </>
            )}

            <div>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--brand)]" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] py-3 pl-12 pr-4 text-[var(--text-primary)] transition-all focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
                />
              </div>
            </div>

            <div>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--brand)]" size={20} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] py-3 pl-12 pr-4 text-[var(--text-primary)] transition-all focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--brand)]" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] py-3 pl-12 pr-4 text-[var(--text-primary)] transition-all focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f4c81] via-[#1d70a2] to-[#2ea38f] py-3 font-semibold text-white transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--brand)]"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
