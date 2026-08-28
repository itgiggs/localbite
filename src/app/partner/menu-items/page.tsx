'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePartnerKitchen } from '@/context/PartnerKitchenContext';
import { useToast } from '@/context/ToastContext';
import { partnerApi, ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBanner from '@/components/ErrorBanner';
import EmptyState from '@/components/EmptyState';
import { VegBadge, SpicyBadge } from '@/components/Badge';
import { formatPrice } from '@/lib/utils';
import type { MenuCategory, MenuItem } from '@/lib/types';

interface ItemForm {
  category_id: number | '';
  name: string;
  description: string;
  price: string;
  image: string;
  is_veg: boolean;
  is_spicy: boolean;
  is_available: boolean;
}

const emptyForm: ItemForm = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  image: '',
  is_veg: true,
  is_spicy: false,
  is_available: true,
};

export default function PartnerMenuItemsPage() {
  const { token } = useAuth();
  const { kitchen, isLoading: kitchenLoading } = usePartnerKitchen();
  const { showToast } = useToast();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    if (!token) return;
    setIsLoading(true);
    Promise.all([partnerApi.menuItems(token), partnerApi.categories(token)])
      .then(([itemsRes, categoriesRes]) => {
        setItems(itemsRes);
        setCategories(categoriesRes);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load menu items.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [token]);

  if (kitchenLoading) return <LoadingSpinner />;
  if (!kitchen) {
    return (
      <EmptyState
        title="Create your kitchen first"
        description="You need an approved kitchen profile before adding menu items."
      />
    );
  }

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? '' });
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      category_id: item.category_id,
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      image: item.image || '',
      is_veg: item.is_veg,
      is_spicy: item.is_spicy,
      is_available: item.is_available,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || form.category_id === '') return;
    setFormError(null);
    setIsSubmitting(true);
    const payload = {
      category_id: Number(form.category_id),
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      image: form.image || undefined,
      is_veg: form.is_veg,
      is_spicy: form.is_spicy,
      is_available: form.is_available,
    };
    try {
      if (editingId) {
        await partnerApi.updateMenuItem(token, editingId, payload);
        showToast('Menu item updated.', 'success');
      } else {
        await partnerApi.createMenuItem(token, payload);
        showToast('Menu item added.', 'success');
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.firstError() : 'Could not save menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await partnerApi.deleteMenuItem(token, id);
      showToast('Menu item deleted.', 'info');
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.firstError() : 'Could not delete menu item.', 'error');
    }
  };

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name || 'Uncategorized';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} menu item{items.length === 1 ? '' : 's'}</p>
        <button
          onClick={openCreateForm}
          disabled={categories.length === 0}
          className="btn-primary disabled:opacity-50"
          title={categories.length === 0 ? 'Add a category first' : undefined}
        >
          + Add menu item
        </button>
      </div>

      {categories.length === 0 && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Add at least one category before creating menu items.
        </div>
      )}

      {showForm && (
        <form  className="card mb-6 flex flex-col gap-4 p-6">
          {formError && <ErrorBanner message={formError} />}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                className="input"
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Price</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={form.is_veg}
                onChange={(e) => setForm({ ...form, is_veg: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-veg focus:ring-veg"
              />
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={form.is_spicy}
                onChange={(e) => setForm({ ...form, is_spicy: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-spicy focus:ring-spicy"
              />
              Spicy
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
              />
              Available
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : editingId ? 'Save changes' : 'Add item'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && <LoadingSpinner />}
      {error && <ErrorBanner message={error} />}
      {!isLoading && !error && items.length === 0 && (
        <EmptyState title="No menu items yet" description="Add your first dish to start selling." />
      )}
      {!isLoading && !error && items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="card flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <VegBadge isVeg={item.is_veg} />
                <div>
                  <p className="font-medium text-ink">
                    {item.name} {item.is_spicy && <SpicyBadge />}
                    {!item.is_available && <span className="ml-2 text-xs text-gray-400">(unavailable)</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {categoryName(item.category_id)} · {formatPrice(item.price)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEditForm(item)} className="btn-ghost px-3 py-1.5 text-sm">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn-ghost px-3 py-1.5 text-sm text-spicy hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
