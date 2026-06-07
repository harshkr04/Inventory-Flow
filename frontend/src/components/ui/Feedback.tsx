import { Loader2 } from "lucide-react";
export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin text-muted-fg`} />;
}
export function PageSpinner() {
  return <div className="flex h-64 items-center justify-center"><Spinner className="h-8 w-8" /></div>;
}
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-12 text-center">
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-fg">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
