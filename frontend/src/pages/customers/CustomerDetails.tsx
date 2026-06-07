import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Customer } from "@/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function CustomerDetails() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: async () => (await api.get(`/customers/${id}`)).data,
  });
  if (isLoading) return <PageSpinner />;
  if (error || !data) return <div className="text-danger">Customer not found.</div>;

  return (
    <div className="space-y-4">
      <Link to="/customers"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <Card>
        <CardHeader><CardTitle>{data.first_name} {data.last_name}</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div><div className="text-muted-fg">Email</div><div className="font-medium">{data.email}</div></div>
          <div><div className="text-muted-fg">Phone</div><div className="font-medium">{data.phone ?? "—"}</div></div>
          <div className="md:col-span-2"><div className="text-muted-fg">Address</div><div className="font-medium whitespace-pre-line">{data.address ?? "—"}</div></div>
          <div><div className="text-muted-fg">Member since</div><div className="font-medium">{formatDate(data.created_at)}</div></div>
        </CardBody>
      </Card>
    </div>
  );
}
