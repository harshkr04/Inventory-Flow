import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { Product } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

interface Props { open: boolean; product: Product | null; onClose: () => void; onSaved: () => void; }

export function ProductFormModal({ open, product, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ name: "", sku: "", description: "", price: "0", stock_quantity: "0" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, sku: product.sku, description: product.description ?? "",
        price: String(product.price), stock_quantity: String(product.stock_quantity),
      });
    } else {
      setForm({ name: "", sku: "", description: "", price: "0", stock_quantity: "0" });
    }
  }, [product, open]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock_quantity, 10);
    if (isNaN(price) || price < 0) return toast.error("Price must be ≥ 0");
    if (isNaN(stock) || stock < 0) return toast.error("Stock must be ≥ 0");

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || null,
      price, stock_quantity: stock,
    };
    setSaving(true);
    try {
      if (product) await api.put(`/products/${product.id}`, payload);
      else await api.post("/products", payload);
      toast.success(product ? "Product updated" : "Product created");
      onSaved(); onClose();
    } catch (err) { toast.error(apiError(err)); }
    finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? "Edit Product" : "Add Product"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button form="product-form" type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </>
      }
    >
      <form id="product-form" onSubmit={onSubmit} className="space-y-3">
        <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Price</Label><Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
          <div><Label>Stock</Label><Input type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} required /></div>
        </div>
      </form>
    </Modal>
  );
}
