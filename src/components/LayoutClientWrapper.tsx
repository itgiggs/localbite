// src/components/LayoutClientWrapper.tsx
'use client';
import React from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import Analytics from '@/components/Analytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';
import OrderNowButton from '@/components/OrderNowButton';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <VercelAnalytics />
          <Analytics />
          <Navbar />
          <PageTransitionWrapper>
            {children}
          </PageTransitionWrapper>
          <Footer />
          <OrderNowButton />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}