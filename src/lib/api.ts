import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import * as local from '@/src/lib/localDb';
import { generateId } from '@/src/lib/format';
import type {
  Address,
  DashboardStats,
  Order,
  OrderStatus,
  Profile,
  Service,
} from '@/src/types';

export async function getServices(): Promise<Service[]> {
  if (!isSupabaseConfigured) return local.localListServices();
  const { data, error } = await supabase!.from('services').select('*').eq('is_active', true).order('base_price');
  if (error) throw error;
  return data ?? [];
}

export async function getAllServices(): Promise<Service[]> {
  if (!isSupabaseConfigured) return local.localListAllServices();
  const { data, error } = await supabase!.from('services').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function upsertService(service: Partial<Service> & Pick<Service, 'name' | 'base_price'>) {
  if (!isSupabaseConfigured) {
    return local.localUpsertService({
      id: service.id ?? generateId('svc-'),
      name: service.name,
      description: service.description ?? '',
      base_price: service.base_price,
      estimated_days: service.estimated_days ?? 2,
      is_active: service.is_active ?? true,
    });
  }
  const payload = {
    id: service.id,
    name: service.name,
    description: service.description ?? '',
    base_price: service.base_price,
    estimated_days: service.estimated_days ?? 2,
    is_active: service.is_active ?? true,
  };
  const { data, error } = await supabase!.from('services').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function getAddresses(userId: string): Promise<Address[]> {
  if (!isSupabaseConfigured) return local.localListAddresses(userId);
  const { data, error } = await supabase!.from('addresses').select('*').eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function saveAddress(address: Omit<Address, 'id'> & { id?: string }) {
  if (!isSupabaseConfigured) return local.localSaveAddress(address);
  const payload = { ...address, id: address.id ?? generateId('addr-') };
  const { data, error } = await supabase!.from('addresses').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(id: string, userId: string) {
  if (!isSupabaseConfigured) return local.localDeleteAddress(id, userId);
  const { error } = await supabase!.from('addresses').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function createOrder(input: {
  customerId: string;
  logisticsType: Order['logistics_type'];
  pickupAddressId?: string;
  scheduledAt: string;
  notes?: string;
  items: { serviceId: string; shoeType: string; quantity: number; notes?: string }[];
  deliveryFee: number;
}): Promise<Order> {
  if (!isSupabaseConfigured) return local.localCreateOrder(input);

  let subtotal = 0;
  const servicePrices = await Promise.all(
    input.items.map(async (item) => {
      const { data } = await supabase!.from('services').select('base_price').eq('id', item.serviceId).single();
      const price = data?.base_price ?? 0;
      subtotal += price * item.quantity;
      return { ...item, unit_price: price };
    }),
  );
  const total = subtotal + input.deliveryFee;
  const { data: order, error } = await supabase!
    .from('orders')
    .insert({
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
    })
    .select()
    .single();
  if (error) throw error;

  await supabase!.from('order_items').insert(
    servicePrices.map((item) => ({
      order_id: order.id,
      service_id: item.serviceId,
      shoe_type: item.shoeType,
      quantity: item.quantity,
      unit_price: item.unit_price,
      notes: item.notes,
    })),
  );
  await supabase!.from('order_status_events').insert({
    order_id: order.id,
    status: 'confirmed',
    note: 'Order placed — cash payment pending',
    created_by: input.customerId,
  });
  return (await getOrder(order.id))!;
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  if (!isSupabaseConfigured) return local.localListOrdersForCustomer(customerId);
  const { data, error } = await supabase!
    .from('orders')
    .select('*, order_items(*, service:services(*)), order_status_events(*), pickup_address:addresses(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getAllOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return local.localListAllOrders();
  const { data, error } = await supabase!
    .from('orders')
    .select('*, customer:profiles!orders_customer_id_fkey(*), order_items(*, service:services(*)), order_status_events(*), pickup_address:addresses(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return local.localGetOrder(id);
  const { data, error } = await supabase!
    .from('orders')
    .select('*, customer:profiles!orders_customer_id_fkey(*), order_items(*, service:services(*)), order_status_events(*), pickup_address:addresses(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note: string, adminId: string) {
  if (!isSupabaseConfigured) return local.localUpdateOrderStatus(orderId, status, note, adminId);
  const { error } = await supabase!.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
  await supabase!.from('order_status_events').insert({
    order_id: orderId,
    status,
    note,
    created_by: adminId,
  });
  return (await getOrder(orderId))!;
}

export async function confirmCashPayment(orderId: string, amount: number, note: string, adminId: string) {
  if (!isSupabaseConfigured) return local.localConfirmPayment(orderId, amount, note, adminId);
  const { error } = await supabase!
    .from('orders')
    .update({
      payment_status: 'paid',
      amount_received: amount,
      payment_note: note,
      payment_confirmed_at: new Date().toISOString(),
      payment_confirmed_by: adminId,
    })
    .eq('id', orderId);
  if (error) throw error;
  await supabase!.from('order_status_events').insert({
    order_id: orderId,
    status: 'payment_confirmed',
    note: `Payment confirmed (cash): ${note || 'No note'}`,
    created_by: adminId,
  });
  return (await getOrder(orderId))!;
}

export async function getCustomers(): Promise<(Profile & { orderCount: number })[]> {
  if (!isSupabaseConfigured) return local.localListCustomers();
  const { data: profiles, error } = await supabase!.from('profiles').select('*').eq('role', 'customer');
  if (error) throw error;
  const { data: orders } = await supabase!.from('orders').select('customer_id');
  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: p.email,
    name: p.name,
    phone: p.phone,
    role: p.role,
    created_at: p.created_at,
    orderCount: (orders ?? []).filter((o) => o.customer_id === p.id).length,
  }));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured) return local.localGetDashboardStats();
  const today = new Date().toISOString().slice(0, 10);
  const { data: orders, error } = await supabase!.from('orders').select('*');
  if (error) throw error;
  const list = orders ?? [];
  return {
    ordersToday: list.filter((o) => o.created_at.slice(0, 10) === today).length,
    cashCollectedToday: list
      .filter((o) => o.payment_status === 'paid' && o.payment_confirmed_at?.slice(0, 10) === today)
      .reduce((sum, o) => sum + (o.amount_received ?? o.total), 0),
    unpaidOrders: list.filter((o) => o.payment_status === 'unpaid' && o.status !== 'cancelled').length,
    pendingPickups: list.filter((o) => ['confirmed', 'pickup_scheduled'].includes(o.status)).length,
    inCleaning: list.filter((o) => ['cleaning', 'quality_check'].includes(o.status)).length,
  };
}

export function subscribeToOrder(orderId: string, onUpdate: () => void) {
  if (!isSupabaseConfigured || !supabase) return () => undefined;
  const channel = supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_status_events', filter: `order_id=eq.${orderId}` }, onUpdate)
    .subscribe();
  return () => {
    supabase!.removeChannel(channel);
  };
}
