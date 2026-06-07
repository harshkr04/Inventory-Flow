import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { Order, OrderStatus, Paginated } from "@/types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { PageSpinner, EmptyState } from "@/components/ui/Feedback";
import { formatCurrency, formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;
const tone = (s: OrderStatus) => s === "confirmed" ? "success" : s === "pending" ? "warning" : "danger";

export default function OrdersList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");

  const { data, isLoading } = useQuery<Paginated<Order>>({
    queryKey: ["orders", status, page],
    queryFn: async () => (await api.get("/orders", {
      params: { status: status || undefined, page, page_size: PAGE_SIZE }
    })).data,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-sm text-muted-fg">All customer orders</p>
        </div>
        <Link to="/orders/new"><Button><Plus className="h-4 w-4" /> Create Order</Button></Link>
      </div>

      <Card>
        <div className="flex items-center gap-3 border-b border-border p-3">
          <span className="text-sm text-muted-fg">Filter</span>
          <Select value={status} onChange={(e) => { setStatus(e.target.value as any); setPage(1); }} className="max-w-[200px]">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>

        {isLoading ? <PageSpinner /> : !data || data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No orders yet"
              description="Create your first order."
              action={<Link to="/orders/new"><Button><Plus className="h-4 w-4" /> Create Order</Button></Link>} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs font-medium uppercase text-muted-fg">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                    <td className="px-4 py-3">{o.customer_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-fg">{formatDate(o.order_date)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(o.total_amount)}</td>
                    <td className="px-4 py-3"><Badge tone={tone(o.status) as any}>{o.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/orders/${o.id}`}>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="px-4 pb-3">
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
