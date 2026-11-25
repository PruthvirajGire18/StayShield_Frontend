'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Home, FileCheck2, LogOut, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Properties & iCal', href: '/dashboard/properties', icon: Home },
    { name: 'Policy Ledger', href: '/dashboard/policies', icon: FileCheck2 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('stayshield_token');
    localStorage.removeItem('stayshield_user');
    router.push('/login');
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-200/50">
      <div className="flex items-center gap-2.5 border-b border-slate-100 p-6 text-xl font-bold tracking-tight text-slate-950">
        <ShieldCheck className="w-7 h-7 text-emerald-600" />
        <span>StayShield</span>
      </div>

      <nav className="flex-1 space-y-1.5 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
