export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email?: string;
  name: string;
  phone?: string;
  role: UserRole;
  created_at?: string;
}

export type LogisticsType = 'pickup_delivery' | 'dropoff';

export type OrderStatus =
  | 'confirmed'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'dropped_off'
  | 'cleaning'
  | 'quality_check'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid';

export interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  estimated_days: number;
  is_active: boolean;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id: string;
  shoe_type: string;
  quantity: number;
  unit_price: number;
  photo_url?: string;
  notes?: string;
  service?: Service;
}

export interface OrderStatusEvent {
  id: string;
  order_id: string;
  status: string;
  note?: string;
  created_at: string;
  created_by?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  logistics_type: LogisticsType;
  status: OrderStatus;
  pickup_address_id?: string;
  scheduled_at: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: 'cash';
  payment_status: PaymentStatus;
  amount_received?: number;
  payment_confirmed_at?: string;
  payment_confirmed_by?: string;
  payment_note?: string;
  notes?: string;
  created_at: string;
  customer?: Profile;
  pickup_address?: Address;
  order_items?: OrderItem[];
  order_status_events?: OrderStatusEvent[];
}

export interface BookingLineItem {
  serviceId: string;
  shoeType: string;
  quantity: number;
  notes?: string;
}

export interface DashboardStats {
  ordersToday: number;
  cashCollectedToday: number;
  unpaidOrders: number;
  pendingPickups: number;
  inCleaning: number;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'confirmed',
  'pickup_scheduled',
  'picked_up',
  'dropped_off',
  'cleaning',
  'quality_check',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Confirmed',
  pickup_scheduled: 'Pickup Scheduled',
  picked_up: 'Picked Up',
  dropped_off: 'Dropped Off',
  cleaning: 'Cleaning',
  quality_check: 'Quality Check',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const SHOP_LOCATION = {
  name: 'Shoe Laundry Studio',
  street: 'Jl. Sudirman No. 45',
  city: 'Jakarta',
  hours: 'Mon–Sat, 9:00 AM – 6:00 PM',
};
