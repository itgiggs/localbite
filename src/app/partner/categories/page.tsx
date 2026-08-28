'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePartnerKitchen } from '@/context/PartnerKitchenContext';
import { useToast } from '@/context/ToastContext';
import { partnerApi, ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBanner from '@/components/ErrorBanner';
import EmptyState from '@/components/EmptyState';
import type { MenuCategory } from '@/lib/types';

export default function PartnerCategoriesPage() {
  const { token } = useAuth();
  const { kitchen, isLoading: kitchenLoading } = usePartnerKitchen();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const load = () => {
    if (!token) return;
    setIsLoading(true);
    partnerApi
      .categories(token)
      .then(setCategories)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load categories.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [token]);

  if (kitchenLoading) return <LoadingSpinner />;
  if (!kitchen) {
    return (
      <EmptyState
        title="Create your kitchen first"
        description="You need an approved kitchen profile before adding menu categories."
      />
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newName.trim()) return;
    setIsCreating(true);
    try {
      await partnerApi.createCategory(token, { name: newName.trim() });
      setNewName('');
      showToast('Category added.', 'success');
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.firstError() : 'Could not add category.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!token || !editingName.trim()) return;
    try {
      await partnerApi.updateCategory(token, id, { name: editingName.trim() });
      showToast('Category updated.', 'success');
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.firstError() : 'Could not update category.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Delete this category? Menu items inside it may also be removed.')) return;
    try {
      await partnerApi.deleteCategory(token, id);
      showToast('Category deleted.', 'info');
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.firstError() : 'Could not delete category.', 'error');
    }
  };

  return (
    <div>
      <form  className="mb-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name (e.g. Starters)"
          className="input"
        />
        <button type="submit" disabled={isCreating} className="btn-primary shrink-0">
          Add
        </button>
      </form>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorBanner message={error} />}
      {!isLoading && !error && categories.length === 0 && (
        <EmptyState title="No categories yet" description="Add your first menu category above." />
      )}
      {!isLoading && !error && categories.length > 0 && (
        <ul className="flex flex-col gap-3">
          {categories.map((cat) => (
            <li key={cat.id} className="card flex items-center justify-between gap-3 p-4">
              {editingId === cat.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="input"
                  autoFocus
                />
              ) : (
                <span className="font-medium text-ink">
                  {cat.name}
                  <span className="badge-count">{cat.items?.length ?? 0} items</span>
                </span>
              )}
              <div className="flex shrink-0 gap-2">
                {editingId === cat.id ? (
                  <>
                    <button onClick={() => handleUpdate(cat.id)} className="btn-secondary px-3 py-1.5 text-sm">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost px-3 py-1.5 text-sm">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                      className="btn-ghost px-3 py-1.5 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="btn-ghost px-3 py-1.5 text-sm text-spicy hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
