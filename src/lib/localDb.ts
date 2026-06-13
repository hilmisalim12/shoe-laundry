import AsyncStorage from '@react-native-async-storage/async-storage';

import { generateId } from '@/src/lib/format';
import type {
  Address,
  DashboardStats,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEvent,
  Profile,
  Service,
} from '@/src/types';

const STORAGE_KEY = 'shoe-laundry-local-db';

const DEFAULT_SERVICES: Service[] = [
  { id: 'svc-1', name: 'Standard Clean', description: 'Basic wash and dry for everyday sneakers.', base_price: 35000, estimated_days: 2, is_active: true },
  { id: 'svc-2', name: 'Deep Clean', description: 'Deep scrub, deodorize, and sole whitening.', base_price: 65000, estimated_days: 3, is_active: true },
  { id: 'svc-3', name: 'Premium Restore', description: 'Full restoration for leather and suede pairs.', base_price: 120000, estimated_days: 5, is_active: true },
  { id: 'svc-4', name: 'Express Clean', description: 'Same-day service for urgent orders.', base_price: 85000, estimated_days: 1, is_active: true },
  { id: 'svc-5', name: 'Sole Repair', description: 'Minor sole and stitching repair.', base_price: 50000, estimated_days: 4, is_active: true },
];

type LocalDb = {
  profiles: Profile[];
  services: Service[];
  addresses: Address[];
  orders: Order[];
  orderItems: OrderItem[];
  orderEvents: OrderStatusEvent[];
  credentials: Record<string, string>;
  resetTokens?: Record<string, { token: string; expiresAt: number }>;
};

let cache: LocalDb | null = null;

async function loadDb(): Promise<LocalDb> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) {
    cache = JSON.parse(raw) as LocalDb;
    return cache;
  }
  cache = {
    profiles: [
      { id: 'admin-local', email: 'admin@shoelaundry.com', name: 'Admin User', phone: '081234567890', role: 'admin' },
    ],
    services: DEFAULT_SERVICES,
    addresses: [],
    orders: [],
    orderItems: [],
    orderEvents: [],
    credentials: { 'admin@shoelaundry.com': 'admin123' },
  };
  await saveDb();
  return cache;
}

async function saveDb() {
  if (!cache) return;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

function hydrateOrder(db: LocalDb, order: Order): Order {
  const customer = db.profiles.find((p) => p.id === order.customer_id);
  const pickup_address = order.pickup_address_id
    ? db.addresses.find((a) => a.id === order.pickup_address_id)
    : undefined;
  const order_items = db.orderItems
    .filter((item) => item.order_id === order.id)
    .map((item) => ({ ...item, service: db.services.find((s) => s.id === item.service_id) }));
  const order_status_events = db.orderEvents
    .filter((e) => e.order_id === order.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return { ...order, customer, pickup_address, order_items, order_status_events };
}

export async function localGetProfile(id: string) {
  const db = await loadDb();
  return db.profiles.find((p) => p.id === id) ?? null;
}

export async function localUpsertProfile(profile: Profile) {
  const db = await loadDb();
  const idx = db.profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) db.profiles[idx] = profile;
  else db.profiles.push(profile);
  await saveDb();
  return profile;
}

export async function localRegister(email: string, password: string, name: string, phone?: string) {
  const db = await loadDb();
  if (db.credentials[email]) throw new Error('Email already registered');
  const id = generateId('user-');
  db.credentials[email] = password;
  const profile: Profile = { id, email, name, phone, role: 'customer' };
  db.profiles.push(profile);
  await saveDb();
  return profile;
}

export async function localLogin(email: string, password: string) {
  const db = await loadDb();
  if (db.credentials[email] !== password) throw new Error('Invalid email or password');
  const profile = db.profiles.find((p) => p.email === email);
  if (!profile) throw new Error('Profile not found');
  return profile;
}

export async function localListServices() {
  const db = await loadDb();
  return db.services.filter((s) => s.is_active);
}

export async function localListAllServices() {
  const db = await loadDb();
  return [...db.services];
}

export async function localUpsertService(service: Service) {
  const db = await loadDb();
  const idx = db.services.findIndex((s) => s.id === service.id);
  if (idx >= 0) db.services[idx] = service;
  else db.services.push(service);
  await saveDb();
  return service;
}

export async function localListAddresses(userId: string) {
  const db = await loadDb();
  return db.addresses.filter((a) => a.user_id === userId);
}

export async function localSaveAddress(address: Omit<Address, 'id'> & { id?: string }) {
  const db = await loadDb();
  const record: Address = { ...address, id: address.id ?? generateId('addr-') };
  const idx = db.addresses.findIndex((a) => a.id === record.id);
  if (idx >= 0) db.addresses[idx] = record;
  else db.addresses.push(record);
  await saveDb();
  return record;
}

export async function localDeleteAddress(id: string, userId: string) {
  const db = await loadDb();
  db.addresses = db.addresses.filter((a) => !(a.id === id && a.user_id === userId));
  await saveDb();
}

export async function localCreateOrder(input: {
  customerId: string;
  logisticsType: Order['logistics_type'];
  pickupAddressId?: string;
  scheduledAt: string;
  notes?: string;
  items: { serviceId: string; shoeType: string; quantity: number; notes?: string }[];
  deliveryFee: number;
}) {
  const db = await loadDb();
  const orderId = generateId('ord-');
  let subtotal = 0;
  const items: OrderItem[] = input.items.map((item) => {
    const service = db.services.find((s) => s.id === item.serviceId);
    const unit_price = service?.base_price ?? 0;
    subtotal += unit_price * item.quantity;
    return {
      id: generateId('item-'),
      order_id: orderId,
      service_id: item.serviceId,
      shoe_type: item.shoeType,
      quantity: item.quantity,
      unit_price,
      notes: item.notes,
    };
  });
  const total = subtotal + input.deliveryFee;
  const order: Order = {
    id: orderId,
    customer_id: input.customerId,
    logistics_type: input.logisticsType,
    status: 'confirmed',
    pickup_address_id: input.pickupAddressId,
    scheduled_at: input.scheduledAt,
    subtotal,
    delivery_fee: input.deliveryFee,
    total,
    payment_method: 'cash',
    payment_status: 'unpaid',
    notes: input.notes,
    created_at: new Date().toISOString(),
  };
  const event: OrderStatusEvent = {
    id: generateId('evt-'),
    order_id: orderId,
    status: 'confirmed',
    note: 'Order placed — cash payment pending',
    created_at: new Date().toISOString(),
    created_by: input.customerId,
  };
  db.orders.unshift(order);
  db.orderItems.push(...items);
  db.orderEvents.push(event);
  await saveDb();
  return hydrateOrder(db, order);
}

export async function localListOrdersForCustomer(customerId: string) {
  const db = await loadDb();
  return db.orders.filter((o) => o.customer_id === customerId).map((o) => hydrateOrder(db, o));
}

export async function localListAllOrders() {
  const db = await loadDb();
  return db.orders.map((o) => hydrateOrder(db, o));
}

export async function localGetOrder(id: string) {
  const db = await loadDb();
  const order = db.orders.find((o) => o.id === id);
  return order ? hydrateOrder(db, order) : null;
}

export async function localUpdateOrderStatus(orderId: string, status: OrderStatus, note: string, adminId: string) {
  const db = await loadDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw new Error('Order not found');
  order.status = status;
  db.orderEvents.push({
    id: generateId('evt-'),
    order_id: orderId,
    status,
    note,
    created_at: new Date().toISOString(),
    created_by: adminId,
  });
  await saveDb();
  return hydrateOrder(db, order);
}

export async function localConfirmPayment(orderId: string, amount: number, note: string, adminId: string) {
  const db = await loadDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw new Error('Order not found');
  order.payment_status = 'paid';
  order.amount_received = amount;
  order.payment_note = note;
  order.payment_confirmed_at = new Date().toISOString();
  order.payment_confirmed_by = adminId;
  db.orderEvents.push({
    id: generateId('evt-'),
    order_id: orderId,
    status: 'payment_confirmed',
    note: `Payment confirmed (cash): ${note || 'No note'}`,
    created_at: new Date().toISOString(),
    created_by: adminId,
  });
  await saveDb();
  return hydrateOrder(db, order);
}

export async function localListCustomers() {
  const db = await loadDb();
  return db.profiles
    .filter((p) => p.role === 'customer')
    .map((p) => ({
      ...p,
      orderCount: db.orders.filter((o) => o.customer_id === p.id).length,
    }));
}

export async function localGetDashboardStats(): Promise<DashboardStats> {
  const db = await loadDb();
  const todayOrders = db.orders.filter((o) => o.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const paidToday = db.orders.filter(
    (o) => o.payment_status === 'paid' && o.payment_confirmed_at?.slice(0, 10) === new Date().toISOString().slice(0, 10),
  );
  return {
    ordersToday: todayOrders.length,
    cashCollectedToday: paidToday.reduce((sum, o) => sum + (o.amount_received ?? o.total), 0),
    unpaidOrders: db.orders.filter((o) => o.payment_status === 'unpaid' && o.status !== 'cancelled').length,
    pendingPickups: db.orders.filter((o) => ['confirmed', 'pickup_scheduled'].includes(o.status)).length,
    inCleaning: db.orders.filter((o) => ['cleaning', 'quality_check'].includes(o.status)).length,
  };
}

export async function localRequestPasswordReset(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const db = await loadDb();
  const accountEmail = Object.keys(db.credentials).find((e) => e.toLowerCase() === normalized);
  if (!accountEmail) {
    throw new Error('No account found with this email address. Please check and try again.');
  }
  const token = generateId('reset-');
  if (!db.resetTokens) db.resetTokens = {};
  db.resetTokens[accountEmail] = { token, expiresAt: Date.now() + 3600000 };
  await saveDb();
  return token;
}

export async function localResetPassword(email: string, token: string, newPassword: string) {
  const normalized = email.trim().toLowerCase();
  const db = await loadDb();
  const accountEmail = Object.keys(db.credentials).find((e) => e.toLowerCase() === normalized);
  if (!accountEmail) throw new Error('Account not found.');
  const entry = db.resetTokens?.[accountEmail];
  if (!entry || entry.token !== token) {
    throw new Error('Invalid reset link. Please request a new password reset.');
  }
  if (entry.expiresAt < Date.now()) {
    throw new Error('This reset link has expired. Please request a new password reset.');
  }
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  db.credentials[accountEmail] = newPassword;
  if (db.resetTokens) delete db.resetTokens[accountEmail];
  await saveDb();
}
