import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { Order } from "@/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Feedback";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrderDetails() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data,
  });

  const cancel = useMutation({
    mutationFn: async () => api.put(`/orders/${id}/cancel`),
    onSuccess: () => { toast.success("Order cancelled"); qc.invalidateQueries({ queryKey: ["order", id] }); },
    onError: (e) => toast.error(apiError(e)),
  });

  if (isLoading) return <PageSpinner />;
  if (error || !data) return <div className="text-danger">Order not found.</div>;

  const tone = data.status === "confirmed" ? "success" : data.status === "pending" ? "warning" : "danger";

  return (
    <div className="space-y-4">
      <Link to="/orders"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Order #{data.id}</CardTitle>
            <p className="mt-1 text-xs text-muted-fg">{formatDate(data.order_date)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={tone as any}>{data.status}</Badge>
            {data.status !== "cancelled" && (
              <Button variant="danger" size="sm" onClick={() => confirm("Cancel this order? Stock will be restored.") && cancel.mutate()}>
                <XCircle className="h-4 w-4" /> Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="text-sm">
            <div className="text-muted-fg">Customer</div>
            <Link to={`/customers/${data.customer_id}`} className="font-medium hover:text-primary">
              {data.customer_name}
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs font-medium uppercase text-muted-fg">
                <tr>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2 text-right">Unit Price</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map(it => (
                  <tr key={it.id}>
                    <td className="px-4 py-2">{it.product_name}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(it.unit_price)}</td>
                    <td className="px-4 py-2 text-right">{it.quantity}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/40">
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold">Total</td>
                  <td className="px-4 py-3 text-right text-base font-semibold">{formatCurrency(data.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
