import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardSummary } from "@/types";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Feedback";
import { formatCurrency, formatDate } from "@/lib/utils";

const PIE_COLORS = ["hsl(0 84% 60%)", "hsl(38 92% 50%)", "hsl(221 83% 53%)", "hsl(142 71% 45%)", "hsl(262 83% 58%)"];

const statusTone = (s: string) =>
  s === "confirmed" ? "success" : s === "pending" ? "warning" : "danger";

function StatCard({ title, value, icon: Icon, tint }: { title: string; value: string; icon: any; tint: string }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4 pt-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tint}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm text-muted-fg">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard/summary")).data,
  });

  if (isLoading) return <PageSpinner />;
  if (error || !data) return <div className="text-danger">Failed to load dashboard.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Products" value={String(data.total_products)} icon={Package} tint="bg-primary/10 text-primary" />
        <StatCard title="Customers" value={String(data.total_customers)} icon={Users} tint="bg-success/10 text-success" />
        <StatCard title="Orders" value={String(data.total_orders)} icon={ShoppingCart} tint="bg-warning/10 text-warning" />
        <StatCard title="Revenue" value={formatCurrency(data.total_revenue)} icon={DollarSign} tint="bg-success/10 text-success" />
        <StatCard title="Low Stock" value={String(data.low_stock_count)} icon={AlertTriangle} tint="bg-danger/10 text-danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue per Month</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 91%)" />
                <XAxis dataKey="month" stroke="hsl(220 10% 45%)" fontSize={12} />
                <YAxis stroke="hsl(220 10% 45%)" fontSize={12} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(221 83% 53%)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Orders per Month</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 91%)" />
                <XAxis dataKey="month" stroke="hsl(220 10% 45%)" fontSize={12} />
                <YAxis stroke="hsl(220 10% 45%)" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
          <CardBody>
            {data.top_products.length === 0 ? (
              <p className="text-sm text-muted-fg">No sales yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.top_products} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 91%)" />
                  <XAxis type="number" stroke="hsl(220 10% 45%)" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={130} stroke="hsl(220 10% 45%)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="quantity_sold" fill="hsl(142 71% 45%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Inventory Distribution</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.inventory_distribution} dataKey="count" nameKey="label" outerRadius={90} label>
                  {data.inventory_distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardBody>
            {data.recent_orders.length === 0 ? (
              <p className="text-sm text-muted-fg">No orders yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {data.recent_orders.map((o) => (
                  <Link to={`/orders/${o.id}`} key={o.id} className="flex items-center justify-between py-3 hover:bg-muted/40 -mx-2 px-2 rounded">
                    <div>
                      <div className="text-sm font-medium">#{o.id} · {o.customer_name}</div>
                      <div className="text-xs text-muted-fg">{formatDate(o.order_date)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatCurrency(o.total_amount)}</span>
                      <Badge tone={statusTone(o.status) as any}>{o.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Low Stock Alerts</CardTitle></CardHeader>
          <CardBody>
            {data.low_stock_items.length === 0 ? (
              <p className="text-sm text-muted-fg">All products are well stocked.</p>
            ) : (
              <div className="divide-y divide-border">
                {data.low_stock_items.map((p) => (
                  <Link to={`/products/${p.id}`} key={p.id} className="flex items-center justify-between py-3 hover:bg-muted/40 -mx-2 px-2 rounded">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-fg">{p.sku}</div>
                    </div>
                    <Badge tone={p.stock_quantity === 0 ? "danger" : "warning"}>
                      {p.stock_quantity === 0 ? "Out of stock" : `${p.stock_quantity} left`}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
