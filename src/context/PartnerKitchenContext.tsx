'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { partnerApi, ApiError } from '@/lib/api';
import type { Kitchen } from '@/lib/types';

interface PartnerKitchenContextValue {
  kitchen: Kitchen | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const PartnerKitchenContext = createContext<PartnerKitchenContextValue | undefined>(undefined);

export function PartnerKitchenProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await partnerApi.getKitchen(token);
      setKitchen(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load your kitchen.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ kitchen, isLoading, error, refresh }), [kitchen, isLoading, error, refresh]);

  return <PartnerKitchenContext.Provider value={value}>{children}</PartnerKitchenContext.Provider>;
}

export function usePartnerKitchen(): PartnerKitchenContextValue {
  const ctx = useContext(PartnerKitchenContext);
  if (!ctx) throw new Error('usePartnerKitchen must be used within a PartnerKitchenProvider');
  return ctx;
}
