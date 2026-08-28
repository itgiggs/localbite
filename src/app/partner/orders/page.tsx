'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePartnerKitchen } from '@/context/PartnerKitchenContext';
import { useToast } from '@/context/ToastContext';
import { partnerApi, ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBanner from '@/components/ErrorBanner';
import EmptyState from '@/components/EmptyState';
import { StatusBadge } from '@/components/Badge';
import {
  formatDateTime,
  formatPrice,
  nextOrderStatus,
  ORDER_STATUS_LABELS,
  orderStatusBadgeClasses,
} from '@/lib/utils';
import type { Order } from '@/lib/types';

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

export default function PartnerOrdersPage() {
  const { token } = useAuth();
  const { kitchen, isLoading: kitchenLoading } = usePartnerKitchen();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    setIsLoading(true);
    partnerApi
      .orders(token, statusFilter === 'all' ? undefined : statusFilter)
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load orders.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [token, statusFilter]);

  if (kitchenLoading) return <LoadingSpinner />;
  if (!kitchen) {
    return <EmptyState title="Create your kitchen first" description="Orders will appear here once your kitchen is approved and live." />;
  }

  const handleAdvance = async (order: Order) => {
    const next = nextOrderStatus(order.status);
    if (!next || !token) return;
    setUpdatingId(order.id);
    try {
      const updated = await partnerApi.updateOrderStatus(token, order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      showToast(`Order #${order.order_number} marked ${ORDER_STATUS_LABELS[next]}.`, 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.firstError() : 'Could not update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`chip ${statusFilter === status ? 'chip-active' : ''}`}
          >
            {status === 'all' ? 'All' : ORDER_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorBanner message={error} />}
      {!isLoading && !error && orders.length === 0 && (
        <EmptyState title="No orders here" description="Orders matching this filter will show up here." />
      )}
      {!isLoading && !error && orders.length > 0 && (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => {
            const next = nextOrderStatus(order.status);
            return (
              <li key={order.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink">#{order.order_number}</p>
                  <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
                  <p className="text-sm text-gray-500">{order.items?.length ?? 0} item(s) · {formatPrice(order.total)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge className={orderStatusBadgeClasses(order.status)}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </StatusBadge>
                  {next && order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleAdvance(order)}
                      disabled={updatingId === order.id}
                      className="btn-secondary px-4 py-1.5 text-sm"
                    >
                      {updatingId === order.id ? 'Updating...' : `Mark as ${ORDER_STATUS_LABELS[next]}`}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
