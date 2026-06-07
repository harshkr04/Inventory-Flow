export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface Product {
  id: number; name: string; sku: string; description?: string | null;
  price: number; stock_quantity: number; created_at: string; updated_at: string;
}

export interface Customer {
  id: number; first_name: string; last_name: string; email: string;
  phone?: string | null; address?: string | null; created_at: string;
}

export interface OrderItem {
  id: number; product_id: number; product_name?: string | null;
  quantity: number; unit_price: number; subtotal: number;
}

export interface Order {
  id: number; customer_id: number; customer_name?: string | null;
  order_date: string; total_amount: number; status: OrderStatus; items: OrderItem[];
}

export interface Paginated<T> { items: T[]; total: number; page: number; page_size: number; }

export interface DashboardSummary {
  total_products: number; total_customers: number; total_orders: number; total_revenue: number;
  low_stock_count: number;
  recent_orders: { id: number; customer_name: string; total_amount: number; status: OrderStatus; order_date: string }[];
  low_stock_items: { id: number; name: string; sku: string; stock_quantity: number }[];
  monthly: { month: string; orders: number; revenue: number }[];
  top_products: { product_id: number; name: string; quantity_sold: number; revenue: number }[];
  inventory_distribution: { label: string; count: number }[];
}
