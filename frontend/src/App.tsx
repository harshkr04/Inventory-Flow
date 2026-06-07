import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ProductsList from "@/pages/products/ProductsList";
import ProductDetails from "@/pages/products/ProductDetails";
import CustomersList from "@/pages/customers/CustomersList";
import CustomerDetails from "@/pages/customers/CustomerDetails";
import OrdersList from "@/pages/orders/OrdersList";
import OrderCreate from "@/pages/orders/OrderCreate";
import OrderDetails from "@/pages/orders/OrderDetails";
import Inventory from "@/pages/Inventory";
import LowStock from "@/pages/LowStock";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/customers" element={<CustomersList />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/orders/new" element={<OrderCreate />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/low-stock" element={<LowStock />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}
