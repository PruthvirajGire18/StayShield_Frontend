'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Home, FileCheck2, AlertTriangle, LogOut } from 'lucide-react';

export default function Navbar({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminOrAdjuster = user?.role === 'super_admin' || user?.role === 'adjuster';

const navLinks = isAdminOrAdjuster
    ? [
        {
          name: user?.role === 'adjuster' ? 'Claims Workbench' : 'Admin Command Center',
          href: '/dashboard/admin',
          icon: ShieldCheck,
        },
      ]
    : [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Properties & iCal', href: '/dashboard/properties', icon: Home },
        { name: 'Policy Ledger', href: '/dashboard/policies', icon: FileCheck2 },
        { name: 'Claims', href: '/dashboard/claims', icon: AlertTriangle },
      ];

  const handleLogout = () => {
    localStorage.removeItem('stayshield_token');
    localStorage.removeItem('stayshield_user');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href={isAdminOrAdjuster ? '/dashboard/admin' : '/dashboard'}
          className="flex items-center gap-2 font-bold text-xl text-white shrink-0"
        >
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          <span>StayShield</span>
          {isAdminOrAdjuster && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {user.role.replace('_', ' ')}
            </span>
          )}
        </Link>

        <nav className="flex items-center gap-2 overflow-x-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold flex items-center justify-center text-xs">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-sm font-medium text-slate-200">{user?.fullName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-rose-400 border border-slate-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}