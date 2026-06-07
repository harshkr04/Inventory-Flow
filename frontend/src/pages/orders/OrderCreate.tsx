import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { Customer, Paginated, Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

interface Line { product_id: number; quantity: number; }

export default function OrderCreate() {
  const nav = useNavigate();
  const [customerId, setCustomerId] = useState<number | "">("");
  const [lines, setLines] = useState<Line[]>([{ product_id: 0, quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  const { data: customers } = useQuery<Paginated<Customer>>({
    queryKey: ["customers-all"],
    queryFn: async () => (await api.get("/customers", { params: { page_size: 100 } })).data,
  });
  const { data: products } = useQuery<Paginated<Product>>({
    queryKey: ["products-all"],
    queryFn: async () => (await api.get("/products", { params: { page_size: 100 } })).data,
  });

  const productMap = useMemo(() => new Map((products?.items ?? []).map(p => [p.id, p])), [products]);
  const total = useMemo(
    () => lines.reduce((sum, l) => sum + (productMap.get(l.product_id)?.price ?? 0) * (l.quantity || 0), 0),
    [lines, productMap]
  );

  const setLine = (idx: number, patch: Partial<Line>) =>
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, ...patch } : l));
  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerId) return toast.error("Select a customer");
    const items = lines.filter(l => l.product_id && l.quantity > 0);
    if (items.length === 0) return toast.error("Add at least one item");

    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", { customer_id: customerId, items });
      toast.success(`Order #${data.id} created`);
      nav(`/orders/${data.id}`);
    } catch (err) { toast.error(apiError(err)); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <Link to="/orders"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>New Order</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Label>Customer</Label>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")} required>
                <option value="">Select customer…</option>
                {customers?.items.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.email}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Items</Label>
              {lines.map((line, idx) => {
                const p = productMap.get(line.product_id);
                const sub = (p?.price ?? 0) * (line.quantity || 0);
                return (
                  <div key={idx} className="grid grid-cols-12 items-end gap-2">
                    <div className="col-span-6">
                      <Select value={line.product_id || ""}
                        onChange={(e) => setLine(idx, { product_id: Number(e.target.value) })}>
                        <option value="">Select product…</option>
                        {products?.items.map(p => (
                          <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                            {p.name} — {formatCurrency(p.price)} (stock: {p.stock_quantity})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min="1" max={p?.stock_quantity || undefined}
                        value={line.quantity}
                        onChange={(e) => setLine(idx, { quantity: Math.max(1, parseInt(e.target.value || "1", 10)) })} />
                    </div>
                    <div className="col-span-3 text-right text-sm font-medium">{formatCurrency(sub)}</div>
                    <div className="col-span-1 text-right">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(idx)} disabled={lines.length === 1}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button type="button" variant="outline" size="sm"
                onClick={() => setLines([...lines, { product_id: 0, quantity: 1 }])}>
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="text-sm text-muted-fg">Total</div>
              <div className="text-2xl font-semibold">{formatCurrency(total)}</div>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/orders"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create Order"}</Button>
        </div>
      </form>
    </div>
  );
}
