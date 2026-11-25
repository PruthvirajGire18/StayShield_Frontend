'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('stayshield_token');
    const savedUser = localStorage.getItem('stayshield_user');

    if (!token) {
      router.replace('/login');
      return;
    }

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (
        (parsedUser.role === 'super_admin' || parsedUser.role === 'adjuster') &&
        pathname === '/dashboard'
      ) {
        router.replace('/dashboard/admin');
      }
    }
  }, [router, pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar user={user} />
      <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}