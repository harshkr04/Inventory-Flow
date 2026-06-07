import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner, EmptyState } from "@/components/ui/Feedback";

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

interface InventoryList {
  items: InventoryItem[];
  total: number;
}

export default function Inventory() {
  const qc = useQueryClient();
  const [adjustments, setAdjustments] = useState<Record<number, string>>({});

  const { data, isLoading } = useQuery<InventoryList>({
    queryKey: ["inventory"],
    queryFn: async () => (await api.get("/inventory")).data,
  });

  const adjustMutation = useMutation({
    mutationFn: async ({ id, adjustment }: { id: number; adjustment: number }) =>
      api.patch(`/inventory/${id}`, { adjustment }),
    onSuccess: (_, vars) => {
      toast.success(`Stock adjusted for product #${vars.id}`);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(apiError(e)),
  });

  const handleAdjust = (id: number, delta: number) => {
    adjustMutation.mutate({ id, adjustment: delta });
  };

  const handleManualAdjust = (id: number) => {
    const val = parseInt(adjustments[id] || "0", 10);
    if (isNaN(val) || val === 0) return toast.error("Enter a non-zero adjustment value");
    adjustMutation.mutate({ id, adjustment: val });
    setAdjustments((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Inventory</h2>
        <p className="text-sm text-muted-fg">View and adjust stock levels for all products</p>
      </div>

      <Card>
        {isLoading ? (
          <PageSpinner />
        ) : !data || data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No products in inventory"
              description="Create products first to manage inventory."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs font-medium uppercase text-muted-fg">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-center">Current Stock</th>
                  <th className="px-4 py-3 text-center">Quick Adjust</th>
                  <th className="px-4 py-3 text-center">Manual Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-fg">{item.sku}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        tone={
                          item.stock_quantity === 0
                            ? "danger"
                            : item.stock_quantity <= 10
                            ? "warning"
                            : "success"
                        }
                      >
                        {item.stock_quantity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAdjust(item.id, -1)}
                          disabled={item.stock_quantity === 0 || adjustMutation.isPending}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-semibold text-lg">
                          {item.stock_quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAdjust(item.id, 1)}
                          disabled={adjustMutation.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          type="number"
                          placeholder="±qty"
                          value={adjustments[item.id] || ""}
                          onChange={(e) =>
                            setAdjustments((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          className="w-20 text-center"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleManualAdjust(item.id)}
                          disabled={adjustMutation.isPending}
                        >
                          Apply
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
