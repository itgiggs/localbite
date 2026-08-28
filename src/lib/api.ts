import type {
  ApiErrorShape,
  Cuisine,
  DeliveryPartner,
  Kitchen,
  MenuCategory,
  MenuItem,
  Order,
  Paginated,
  Review,
  Role,
  User,
} from './types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** First validation message, if any, otherwise the top-level message. */
  firstError(): string {
    if (this.errors) {
      const firstKey = Object.keys(this.errors)[0];
      if (firstKey && this.errors[firstKey]?.[0]) return this.errors[firstKey][0];
    }
    return this.message;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildQuery(query?: RequestOptions['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, query } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch (err) {
    throw new ApiError(
      'Could not reach the CloudBite server. Please check your connection and try again.',
      0,
    );
  }

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const shape = (data || {}) as Partial<ApiErrorShape>;
    throw new ApiError(
      shape.message || `Request failed with status ${response.status}`,
      response.status,
      shape.errors,
    );
  }

  return data as T;
}

// ---------- Auth ----------
export const authApi = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: Extract<Role, 'customer' | 'kitchen_owner'>;
  }) => apiFetch<{ user: User; token: string }>('/register', { method: 'POST', body: payload }),

  login: (payload: { email: string; password: string }) =>
    apiFetch<{ user: User; token: string }>('/login', { method: 'POST', body: payload }),

  logout: (token: string) => apiFetch<{ message: string }>('/logout', { method: 'POST', token }),

  me: (token: string) => apiFetch<User>('/me', { token }),
};

// ---------- Public browsing ----------
export const publicApi = {
  cuisines: () => apiFetch<Cuisine[]>('/cuisines'),

  kitchens: (params: {
    cuisine?: string;
    city?: string;
    search?: string;
    veg_only?: boolean;
    sort?: 'rating' | 'newest';
    page?: number;
  } = {}) =>
    apiFetch<Paginated<Kitchen>>('/kitchens', {
      query: {
        cuisine: params.cuisine,
        city: params.city,
        search: params.search,
        veg_only: params.veg_only ? 1 : undefined,
        sort: params.sort,
        page: params.page,
      },
    }),

  kitchen: (slug: string) => apiFetch<Kitchen>(`/kitchens/${slug}`),

  kitchenReviews: (slug: string, page = 1) =>
    apiFetch<Paginated<Review>>(`/kitchens/${slug}/reviews`, { query: { page } }),
};

// ---------- Customer ----------
export const customerApi = {
  createOrder: (
    token: string,
    payload: {
      kitchen_id: number;
      items: { menu_item_id: number; quantity: number }[];
      delivery_address: string;
      notes?: string;
    },
  ) => apiFetch<Order>('/orders', { method: 'POST', body: payload, token }),

  orders: (token: string, page = 1) =>
    apiFetch<Paginated<Order>>('/orders', { token, query: { page } }),

  order: (token: string, id: number) => apiFetch<Order>(`/orders/${id}`, { token }),

  cancelOrder: (token: string, id: number) =>
    apiFetch<Order>(`/orders/${id}/cancel`, { method: 'POST', token }),

  createReview: (
    token: string,
    payload: { kitchen_id: number; order_id: number; rating: number; comment?: string },
  ) => apiFetch<Review>('/reviews', { method: 'POST', body: payload, token }),
};

// ---------- Kitchen partner ----------
export interface KitchenProfilePayload {
  name: string;
  description?: string;
  logo?: string;
  cover_image?: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  opening_time: string;
  closing_time: string;
  is_halal?: boolean;
  cuisine_ids?: number[];
}

export const partnerApi = {
  getKitchen: (token: string) => apiFetch<Kitchen | null>('/partner/kitchen', { token }),

  createKitchen: (token: string, payload: KitchenProfilePayload) =>
    apiFetch<Kitchen>('/partner/kitchen', { method: 'POST', body: payload, token }),

  updateKitchen: (token: string, payload: Partial<KitchenProfilePayload>) =>
    apiFetch<Kitchen>('/partner/kitchen', { method: 'PUT', body: payload, token }),

  categories: (token: string) => apiFetch<MenuCategory[]>('/partner/categories', { token }),

  createCategory: (token: string, payload: { name: string; sort_order?: number }) =>
    apiFetch<MenuCategory>('/partner/categories', { method: 'POST', body: payload, token }),

  updateCategory: (
    token: string,
    id: number,
    payload: { name?: string; sort_order?: number },
  ) => apiFetch<MenuCategory>(`/partner/categories/${id}`, { method: 'PUT', body: payload, token }),

  deleteCategory: (token: string, id: number) =>
    apiFetch<{ message: string }>(`/partner/categories/${id}`, { method: 'DELETE', token }),

  menuItems: (token: string) => apiFetch<MenuItem[]>('/partner/menu-items', { token }),

  createMenuItem: (
    token: string,
    payload: {
      category_id: number;
      name: string;
      description?: string;
      price: number;
      image?: string;
      is_veg?: boolean;
      is_spicy?: boolean;
      is_available?: boolean;
      sort_order?: number;
    },
  ) => apiFetch<MenuItem>('/partner/menu-items', { method: 'POST', body: payload, token }),

  updateMenuItem: (token: string, id: number, payload: Partial<{
    category_id: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    is_veg: boolean;
    is_spicy: boolean;
    is_available: boolean;
    sort_order: number;
  }>) => apiFetch<MenuItem>(`/partner/menu-items/${id}`, { method: 'PUT', body: payload, token }),

  deleteMenuItem: (token: string, id: number) =>
    apiFetch<{ message: string }>(`/partner/menu-items/${id}`, { method: 'DELETE', token }),

  orders: (token: string, status?: string) =>
    apiFetch<Paginated<Order>>('/partner/orders', { token, query: { status } }),

  updateOrderStatus: (token: string, id: number, status: string) =>
    apiFetch<Order>(`/partner/orders/${id}/status`, { method: 'PUT', body: { status }, token }),
};

// ---------- Admin ----------
export const adminApi = {
  kitchens: (token: string, status?: string) =>
    apiFetch<Paginated<Kitchen>>('/admin/kitchens', { token, query: { status } }),

  approveKitchen: (token: string, id: number) =>
    apiFetch<Kitchen>(`/admin/kitchens/${id}/approve`, { method: 'PUT', token }),

  rejectKitchen: (token: string, id: number) =>
    apiFetch<Kitchen>(`/admin/kitchens/${id}/reject`, { method: 'PUT', token }),

  reviews: (token: string) => apiFetch<Paginated<Review>>('/admin/reviews', { token }),

  deleteReview: (token: string, id: number) =>
    apiFetch<{ message: string }>(`/admin/reviews/${id}`, { method: 'DELETE', token }),

  orders: (token: string, params: { status?: string; kitchen_id?: number } = {}) =>
    apiFetch<Paginated<Order>>('/admin/orders', { token, query: params }),

  users: (token: string) => apiFetch<Paginated<User>>('/admin/users', { token }),

  deliveryPartners: (token: string) =>
    apiFetch<Paginated<DeliveryPartner> | DeliveryPartner[]>('/admin/delivery-partners', { token }),

  createDeliveryPartner: (
    token: string,
    payload: { name: string; phone: string; vehicle_type?: string },
  ) =>
    apiFetch<DeliveryPartner>('/admin/delivery-partners', { method: 'POST', body: payload, token }),

  updateDeliveryPartner: (
    token: string,
    id: number,
    payload: Partial<{ name: string; phone: string; vehicle_type: string; status: string }>,
  ) =>
    apiFetch<DeliveryPartner>(`/admin/delivery-partners/${id}`, {
      method: 'PUT',
      body: payload,
      token,
    }),
};
