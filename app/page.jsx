'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('stayshield_token');
    if (token) {
      router.replace('/dashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  // Jab tak token check ho raha hai, aapka original spinner dikhega
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600 shadow-sm"></div>
      </div>
    );
  }

  // Logged-out users ke liye Customer Onboarding Landing Page
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              StayShield
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#onboarding" className="hover:text-emerald-600 transition">
              Onboarding Flow
            </a>
            <a href="#features" className="hover:text-emerald-600 transition">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Automated Property & Policy Protection
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
            Protect Every Stay Without the Operational Headache
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Onboard your rental properties in minutes. Sync booking calendars automatically, monitor active policy timelines in real time, and submit claims effortlessly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-base hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
            >
              Start Free Onboarding →
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-slate-700 font-semibold text-base border border-slate-200 hover:bg-slate-50 transition shadow-sm"
            >
              Sign in to Dashboard
            </Link>
          </div>
        </section>

        {/* 3-Step Customer Onboarding Section */}
        <section id="onboarding" className="border-y border-slate-200/80 bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-slate-900">
                Onboard in 3 Simple Steps
              </h2>
              <p className="mt-3 text-slate-600">
                Go from signup to active 24/7 property monitoring in under 5 minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-7 rounded-2xl bg-[#f6f8fb] border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center mb-5 shadow-sm">
                  1
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Create Host Account
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Register your profile and add your rental properties with basic listing details in a guided setup.
                </p>
              </div>

              <div className="p-7 rounded-2xl bg-[#f6f8fb] border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center mb-5 shadow-sm">
                  2
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Sync Calendar & Policy
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Connect your iCal booking feed so StayShield automatically tracks upcoming stays and activates coverage.
                </p>
              </div>

              <div className="p-7 rounded-2xl bg-[#f6f8fb] border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center mb-5 shadow-sm">
                  3
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Monitor & File Claims
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  View active policy windows on one timeline and file documented claims in a few clicks when needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Grid */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">
                Automated iCal Sync
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Background synchronization keeps your property calendars and stay schedules updated automatically.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">
                Policy Timeline Tracking
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Real-time visibility into active, pending, and completed protection windows across your portfolio.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">
                Fast Claim Workflow
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Guided claim submission and transparent status tracking without scattered email threads.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="rounded-2xl bg-emerald-600 p-10 md:p-12 text-center text-white shadow-lg shadow-emerald-600/20">
            <h2 className="text-2xl md:text-3xl font-bold">
              Ready to protect your properties?
            </h2>
            <p className="mt-2 text-emerald-50 max-w-xl mx-auto text-sm md:text-base">
              Complete your onboarding in minutes and let StayShield handle the monitoring.
            </p>
            <Link
              href="/register"
              className="inline-block mt-6 px-8 py-3.5 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition shadow-sm"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} StayShield. All rights reserved.
      </footer>
    </div>
  );
}