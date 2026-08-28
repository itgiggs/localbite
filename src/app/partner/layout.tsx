'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PartnerKitchenProvider } from '@/context/PartnerKitchenContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/partner', label: 'Kitchen profile' },
  { href: '/partner/categories', label: 'Categories' },
  { href: '/partner/menu-items', label: 'Menu items' },
  { href: '/partner/orders', label: 'Orders' },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login?redirect=/partner');
    } else if (user.role !== 'kitchen_owner') {
      router.push('/');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'kitchen_owner') return <LoadingSpinner />;

  return (
    <PartnerKitchenProvider>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-ink">Partner dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your kitchen, menu, and incoming orders.</p>

        <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-gray-100 pb-px">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium',
                pathname === tab.href
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-ink',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6">{children}</div>
      </div>
    </PartnerKitchenProvider>
  );
}
