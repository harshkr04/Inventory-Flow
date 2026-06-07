import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { api, apiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function Login() {
  const { token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const loc = useLocation() as { state?: { from?: { pathname: string } } };

  const [email, setEmail] = useState("admin@ioms.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.access_token, data.user);
      toast.success(`Welcome back, ${data.user.full_name}`);
      navigate(loc.state?.from?.pathname ?? "/", { replace: true });
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-fg">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">IOMS</h1>
            <p className="text-xs text-muted-fg">Inventory & Order Management</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-fg">
          Demo: admin@ioms.com / admin123
        </p>
      </div>
    </div>
  );
}
