'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    countryCode: 'IN',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      localStorage.setItem('stayshield_token', res.data.data.token);
      localStorage.setItem('stayshield_user', JSON.stringify(res.data.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7f6] px-4 py-8 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-teal-100/60 blur-3xl" />
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-slate-300/50 lg:min-h-[760px] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-10 text-white lg:flex xl:p-14">
          <div className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 -top-6 h-52 w-52 rounded-full border border-white/10" />
          <div className="relative flex items-center gap-3 text-xl font-bold tracking-tight">
            <ShieldCheck className="h-10 w-10 rounded-xl bg-white/10 p-2 text-emerald-200 ring-1 ring-white/15" />
            <span>StayShield</span>
          </div>
          <div className="relative max-w-md pb-4">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">A simpler way to host</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Start with confidence. Host with care.
            </h1>
            <div className="mt-8 h-1 w-14 rounded-full bg-emerald-300" />
          </div>
          <ShieldCheck className="pointer-events-none absolute -bottom-20 -right-16 h-80 w-80 text-white/[0.06]" />
        </aside>

        <section className="flex items-center justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 text-xl font-bold tracking-tight text-slate-950 lg:hidden">
              <ShieldCheck className="h-10 w-10 rounded-xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-600/20" />
              <span>StayShield</span>
            </div>
            <div className="mb-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Host account</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Create your account</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Start protecting your vacation rentals only on nights guests stay.
              </p>
            </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm leading-5 text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              placeholder="Pruthviraj Gire"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              placeholder="pruthviraj@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone Number</label>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              placeholder="Min 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-emerald-700 transition-colors hover:text-emerald-800 hover:underline">
            Sign In
          </Link>
        </p>
          </div>
        </section>
      </div>
    </main>
  );
}
