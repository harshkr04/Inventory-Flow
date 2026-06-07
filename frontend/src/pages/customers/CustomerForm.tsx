import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { Customer } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

interface Props { open: boolean; customer: Customer | null; onClose: () => void; onSaved: () => void; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CustomerFormModal({ open, customer, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) setForm({
      first_name: customer.first_name, last_name: customer.last_name, email: customer.email,
      phone: customer.phone ?? "", address: customer.address ?? "",
    });
    else setForm({ first_name: "", last_name: "", email: "", phone: "", address: "" });
  }, [customer, open]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(form.email)) return toast.error("Invalid email address");
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    };
    setSaving(true);
    try {
      if (customer) await api.put(`/customers/${customer.id}`, payload);
      else await api.post("/customers", payload);
      toast.success(customer ? "Customer updated" : "Customer created");
      onSaved(); onClose();
    } catch (err) { toast.error(apiError(err)); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={customer ? "Edit Customer" : "Add Customer"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button form="customer-form" type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </>
      }>
      <form id="customer-form" onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>First name</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required /></div>
          <div><Label>Last name</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required /></div>
        </div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div><Label>Address</Label><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      </form>
    </Modal>
  );
}
