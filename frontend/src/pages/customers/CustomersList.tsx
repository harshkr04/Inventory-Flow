import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { Customer, Paginated } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PageSpinner, EmptyState } from "@/components/ui/Feedback";
import { CustomerFormModal } from "./CustomerForm";
import { useAuthStore } from "@/store/auth";

const PAGE_SIZE = 10;

export default function CustomersList() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [creating, setCreating] = useState(false);
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery<Paginated<Customer>>({
    queryKey: ["customers", q, page],
    queryFn: async () => (await api.get("/customers", { params: { q: q || undefined, page, page_size: PAGE_SIZE } })).data,
  });

  const del = useMutation({
    mutationFn: async (id: number) => api.delete(`/customers/${id}`),
    onSuccess: () => { toast.success("Customer deleted"); qc.invalidateQueries({ queryKey: ["customers"] }); },
    onError: (e) => toast.error(apiError(e)),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Customers</h2>
          <p className="text-sm text-muted-fg">Manage your customer base</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Add Customer</Button>
      </div>

      <Card>
        <div className="flex items-center gap-2 border-b border-border p-3">
          <Search className="h-4 w-4 text-muted-fg" />
          <Input placeholder="Search by name or email…" value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="border-0 focus:ring-0" />
        </div>

        {isLoading ? <PageSpinner /> : !data || data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No customers found"
              description={q ? "Try a different search." : "Create your first customer to get started."}
              action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Add Customer</Button>} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs font-medium uppercase text-muted-fg">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <Link to={`/customers/${c.id}`} className="hover:text-primary">{c.first_name} {c.last_name}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-fg">{c.email}</td>
                    <td className="px-4 py-3 text-muted-fg">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>
                        {user?.role === "admin" && (
                          <Button variant="ghost" size="icon"
                            onClick={() => confirm(`Delete "${c.first_name} ${c.last_name}"?`) && del.mutate(c.id)}>
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        )}
                      </div>
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

      <CustomerFormModal open={creating || !!editing} customer={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSaved={() => qc.invalidateQueries({ queryKey: ["customers"] })} />
    </div>
  );
}
