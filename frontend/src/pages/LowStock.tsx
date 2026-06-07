import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { Paginated, Product } from "@/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner, EmptyState } from "@/components/ui/Feedback";

export default function LowStock() {
  // Fetch a large page and filter client-side (threshold = 10)
  const { data, isLoading } = useQuery<Paginated<Product>>({
    queryKey: ["products-lowstock"],
    queryFn: async () => (await api.get("/products", { params: { page_size: 100 } })).data,
  });

  if (isLoading) return <PageSpinner />;
  const low = (data?.items ?? []).filter(p => p.stock_quantity <= 10)
    .sort((a, b) => a.stock_quantity - b.stock_quantity);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Low Stock Report</h2>
        <p className="text-sm text-muted-fg">Products at or below the 10-unit threshold</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" /> {low.length} item{low.length === 1 ? "" : "s"} need attention
        </CardTitle></CardHeader>
        <CardBody>
          {low.length === 0 ? (
            <EmptyState title="All products well stocked" description="Nothing under the threshold right now." />
          ) : (
            <div className="divide-y divide-border">
              {low.map(p => (
                <Link to={`/products/${p.id}`} key={p.id} className="flex items-center justify-between py-3 hover:bg-muted/30 -mx-2 px-2 rounded">
                  <div>
                    <div className="font-medium">{p.name}</div>
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
  );
}
