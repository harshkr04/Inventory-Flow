from datetime import datetime, timedelta, timezone
import random
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from .core.database import SessionLocal, engine, Base
from .core.security import hash_password
from .models import User, UserRole, Product, Customer, Order, OrderItem, OrderStatus


def seed_if_empty() -> None:
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        if db.scalar(select(func.count(User.id))) == 0:
            db.add_all([
                User(email="admin@ioms.com", full_name="Admin User",
                     hashed_password=hash_password("admin123"), role=UserRole.ADMIN),
                User(email="manager@ioms.com", full_name="Manager User",
                     hashed_password=hash_password("manager123"), role=UserRole.MANAGER),
            ])
            db.commit()

        if db.scalar(select(func.count(Product.id))) == 0:
            sample_products = [
                ("Wireless Mouse", "SKU-WM-001", "Ergonomic 2.4GHz wireless mouse", 29.99, 120),
                ("Mechanical Keyboard", "SKU-KB-002", "RGB mechanical keyboard, blue switches", 89.50, 45),
                ("27\" 4K Monitor", "SKU-MN-003", "IPS panel, HDR10, USB-C", 379.00, 18),
                ("USB-C Hub", "SKU-HB-004", "7-in-1 USB-C hub with HDMI", 49.99, 8),
                ("Noise-Cancelling Headphones", "SKU-HP-005", "Over-ear ANC headphones", 199.00, 25),
                ("Webcam 1080p", "SKU-WC-006", "Full HD streaming webcam", 59.00, 60),
                ("Standing Desk", "SKU-DS-007", "Electric height-adjustable desk", 449.00, 5),
                ("Office Chair", "SKU-CH-008", "Ergonomic mesh chair", 289.00, 12),
                ("Laptop Stand", "SKU-LS-009", "Aluminum laptop stand", 39.90, 0),
                ("Desk Lamp", "SKU-DL-010", "LED desk lamp with USB charging", 34.50, 75),
            ]
            db.add_all([
                Product(name=n, sku=s, description=d, price=p, stock_quantity=q)
                for (n, s, d, p, q) in sample_products
            ])
            db.commit()

        if db.scalar(select(func.count(Customer.id))) == 0:
            db.add_all([
                Customer(first_name="Alice", last_name="Johnson", email="alice@example.com",
                         phone="+1-555-0101", address="123 Main St, Springfield"),
                Customer(first_name="Bob", last_name="Smith", email="bob@example.com",
                         phone="+1-555-0102", address="456 Oak Ave, Shelbyville"),
                Customer(first_name="Carol", last_name="Davis", email="carol@example.com",
                         phone="+1-555-0103", address="789 Pine Rd, Capital City"),
                Customer(first_name="David", last_name="Lee", email="david@example.com",
                         phone="+1-555-0104", address="321 Elm Blvd, Ogdenville"),
            ])
            db.commit()

        if db.scalar(select(func.count(Order.id))) == 0:
            customers = list(db.scalars(select(Customer)).all())
            products = list(db.scalars(select(Product).where(Product.stock_quantity > 0)).all())
            if customers and products:
                random.seed(42)
                now = datetime.now(timezone.utc)
                for i in range(12):
                    days_back = random.randint(0, 150)
                    order_date = now - timedelta(days=days_back)
                    cust = random.choice(customers)
                    chosen = random.sample(products, k=min(len(products), random.randint(1, 3)))
                    order = Order(customer_id=cust.id, status=OrderStatus.CONFIRMED, order_date=order_date, total_amount=0)
                    db.add(order)
                    db.flush()
                    total = 0
                    for p in chosen:
                        qty = random.randint(1, min(3, p.stock_quantity)) if p.stock_quantity > 0 else 1
                        sub = float(p.price) * qty
                        total += sub
                        db.add(OrderItem(order_id=order.id, product_id=p.id, quantity=qty,
                                         unit_price=p.price, subtotal=sub))
                        p.stock_quantity = max(0, p.stock_quantity - qty)
                    order.total_amount = total
                db.commit()
    finally:
        db.close()
