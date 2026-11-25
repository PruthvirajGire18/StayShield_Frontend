'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('stayshield_token');
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600 shadow-sm"></div>
    </div>
  );
}
