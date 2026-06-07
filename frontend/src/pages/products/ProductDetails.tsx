import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProductDetails() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => (await api.get(`/products/${id}`)).data,
  });
  if (isLoading) return <PageSpinner />;
  if (error || !data) return <div className="text-danger">Product not found.</div>;

  return (
    <div className="space-y-4">
      <Link to="/products"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <Card>
        <CardHeader><CardTitle>{data.name}</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div><div className="text-muted-fg">SKU</div><div className="font-medium">{data.sku}</div></div>
            <div><div className="text-muted-fg">Price</div><div className="font-medium">{formatCurrency(data.price)}</div></div>
            <div><div className="text-muted-fg">Stock</div>
              <Badge tone={data.stock_quantity === 0 ? "danger" : data.stock_quantity <= 10 ? "warning" : "success"}>
                {data.stock_quantity}
              </Badge>
            </div>
            <div><div className="text-muted-fg">Updated</div><div className="font-medium">{formatDate(data.updated_at)}</div></div>
          </div>
          {data.description && (
            <div>
              <div className="mb-1 text-sm text-muted-fg">Description</div>
              <p className="text-sm">{data.description}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
