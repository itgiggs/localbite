export type Role = 'customer' | 'kitchen_owner' | 'admin' | 'delivery_partner';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatar?: string | null;
  created_at?: string;
}

export interface Cuisine {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
}

export type KitchenStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Kitchen {
  id: number;
  owner_id?: number;
  slug: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  address?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email?: string | null;
  opening_time?: string;
  closing_time?: string;
  is_halal?: boolean;
  status?: KitchenStatus;
  avg_rating: number;
  total_reviews: number;
  cuisines: Cuisine[];
  categories?: MenuCategory[];
}

export interface MenuCategory {
  id: number;
  kitchen_id?: number;
  name: string;
  sort_order?: number;
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  kitchen_id?: number;
  category_id: number;
  name: string;
  slug?: string;
  description?: string | null;
  price: number | string;
  image?: string | null;
  is_veg: boolean;
  is_spicy: boolean;
  is_available: boolean;
  sort_order?: number;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  menu_item_id: number | null;
  item_name: string;
  item_price: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  kitchen_id: number;
  kitchen?: Kitchen;
  status: OrderStatus;
  subtotal: number | string;
  delivery_fee: number | string;
  tax: number | string;
  total: number | string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: string;
  delivery_address: string;
  delivery_partner_id?: number | null;
  notes?: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: number;
  customer_id: number;
  kitchen_id: number;
  order_id?: number | null;
  rating: number;
  comment?: string | null;
  is_published?: boolean;
  created_at: string;
  customer?: { id: number; name: string };
}

export type DeliveryPartnerStatus = 'pending' | 'active' | 'inactive';

export interface DeliveryPartner {
  id: number;
  user_id?: number | null;
  name: string;
  phone: string;
  vehicle_type?: string | null;
  status: DeliveryPartnerStatus;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface Paginated<T> {
  data: T[];
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginationMeta;
}

export interface ApiErrorShape {
  message: string;
  errors?: Record<string, string[]>;
}
