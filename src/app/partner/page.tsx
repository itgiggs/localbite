'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePartnerKitchen } from '@/context/PartnerKitchenContext';
import { useToast } from '@/context/ToastContext';
import { partnerApi, publicApi, ApiError, KitchenProfilePayload } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBanner from '@/components/ErrorBanner';
import { StatusBadge } from '@/components/Badge';
import type { Cuisine } from '@/lib/types';

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-veg',
  rejected: 'bg-red-100 text-spicy',
  suspended: 'bg-gray-200 text-gray-600',
};

const emptyForm: KitchenProfilePayload = {
  name: '',
  description: '',
  logo: '',
  cover_image: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  opening_time: '09:00',
  closing_time: '22:00',
  is_halal: false,
  cuisine_ids: [],
};

export default function PartnerKitchenPage() {
  const { token } = useAuth();
  const { kitchen, isLoading, error, refresh } = usePartnerKitchen();
  const { showToast } = useToast();

  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [form, setForm] = useState<KitchenProfilePayload>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    publicApi.cuisines().then(setCuisines).catch(() => setCuisines([]));
  }, []);

  useEffect(() => {
    if (kitchen) {
      setForm({
        name: kitchen.name || '',
        description: kitchen.description || '',
        logo: kitchen.logo || '',
        cover_image: kitchen.cover_image || '',
        address: kitchen.address || '',
        city: kitchen.city || '',
        phone: kitchen.phone || '',
        email: kitchen.email || '',
        opening_time: kitchen.opening_time || '09:00',
        closing_time: kitchen.closing_time || '22:00',
        is_halal: kitchen.is_halal || false,
        cuisine_ids: kitchen.cuisines?.map((c) => c.id) || [],
      });
    }
  }, [kitchen]);

  if (isLoading) return <LoadingSpinner label="Loading your kitchen..." />;
  if (error) return <ErrorBanner message={error} />;

  const toggleCuisine = (id: number) => {
    setForm((f) => ({
      ...f,
      cuisine_ids: f.cuisine_ids?.includes(id)
        ? f.cuisine_ids.filter((c) => c !== id)
        : [...(f.cuisine_ids || []), id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (kitchen) {
        await partnerApi.updateKitchen(token, form);
        showToast('Kitchen profile updated.', 'success');
      } else {
        await partnerApi.createKitchen(token, form);
        showToast('Application submitted! Awaiting admin approval.', 'success');
      }
      await refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.firstError() : 'Could not save your kitchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {kitchen && (
        <div className="mb-6 flex items-center gap-3">
          <StatusBadge className={STATUS_CLASSES[kitchen.status || 'pending']}>
            {(kitchen.status || 'pending').toUpperCase()}
          </StatusBadge>
          {kitchen.status === 'pending' && (
            <span className="text-sm text-gray-500">Your kitchen is awaiting admin approval.</span>
          )}
          {kitchen.status === 'rejected' && (
            <span className="text-sm text-gray-500">Your application was rejected. Update your details and resubmit.</span>
          )}
          {kitchen.status === 'suspended' && (
            <span className="text-sm text-gray-500">Your kitchen is currently suspended.</span>
          )}
        </div>
      )}

      {!kitchen && (
        <div className="mb-6 rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
          You haven&apos;t created a kitchen yet. Fill out the form below to apply as a CloudBite partner.
        </div>
      )}

      <form onSubmit={handleSubmit}  className="card flex flex-col gap-5 p-6">
        {formError && <ErrorBanner message={formError} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Kitchen name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="label">Address</label>
          <input
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Phone</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Contact email (optional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Logo URL</label>
            <input
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              className="input"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="label">Cover image URL</label>
            <input
              value={form.cover_image}
              onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
              className="input"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Opening time</label>
            <input
              type="time"
              required
              value={form.opening_time}
              onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Closing time</label>
            <input
              type="time"
              required
              value={form.closing_time}
              onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={!!form.is_halal}
            onChange={(e) => setForm({ ...form, is_halal: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-veg focus:ring-veg"
          />
          Halal certified
        </label>

        <div>
          <span className="label">Cuisines</span>
          <div className="flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggleCuisine(c.id)}
                className={`chip ${form.cuisine_ids?.includes(c.id) ? 'chip-active' : ''}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary self-start">
          {isSubmitting ? 'Saving...' : kitchen ? 'Save changes' : 'Submit application'}
        </button>
      </form>
    </div>
  );
}
