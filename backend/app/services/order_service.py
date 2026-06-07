from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..models import Order, OrderItem, OrderStatus, Product, Customer
from ..repositories.order_repo import OrderRepository
from ..schemas import OrderCreate


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderRepository(db)

    def list(self, status_filter, page, page_size):
        return self.repo.list(status_filter, page, page_size)

    def get(self, oid: int) -> Order:
        o = self.repo.get(oid)
        if not o:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
        return o

    def create(self, data: OrderCreate) -> Order:
        # Use a single transaction; rollback on any failure
        try:
            customer = self.db.get(Customer, data.customer_id)
            if not customer:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")

            if not data.items:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Order must have at least one item")

            # Aggregate quantities by product to validate stock once per product
            agg: dict[int, int] = {}
            for item in data.items:
                if item.quantity <= 0:
                    raise HTTPException(status.HTTP_400_BAD_REQUEST, "Quantity must be positive")
                agg[item.product_id] = agg.get(item.product_id, 0) + item.quantity

            # Lock product rows
            products = {
                p.id: p for p in self.db.scalars(
                    select(Product).where(Product.id.in_(agg.keys())).with_for_update()
                ).all()
            }

            for pid, qty in agg.items():
                p = products.get(pid)
                if not p:
                    raise HTTPException(status.HTTP_404_NOT_FOUND, f"Product {pid} not found")
                if p.stock_quantity < qty:
                    raise HTTPException(
                        status.HTTP_400_BAD_REQUEST,
                        f"Insufficient stock for '{p.name}' (have {p.stock_quantity}, need {qty})",
                    )

            order = Order(customer_id=customer.id, status=OrderStatus.CONFIRMED, total_amount=0)
            self.db.add(order)
            self.db.flush()

            total = Decimal("0")
            for item in data.items:
                p = products[item.product_id]
                unit_price = Decimal(str(p.price))
                subtotal = unit_price * item.quantity
                total += subtotal
                self.db.add(OrderItem(
                    order_id=order.id,
                    product_id=p.id,
                    quantity=item.quantity,
                    unit_price=unit_price,
                    subtotal=subtotal,
                ))
                p.stock_quantity = p.stock_quantity - item.quantity

            order.total_amount = total
            self.db.commit()
            self.db.refresh(order)
            return order
        except HTTPException:
            self.db.rollback()
            raise
        except Exception:
            self.db.rollback()
            raise

    def cancel(self, oid: int) -> Order:
        try:
            order = self.get(oid)
            if order.status == OrderStatus.CANCELLED:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Order already cancelled")
            # Restore stock for confirmed orders
            if order.status == OrderStatus.CONFIRMED:
                for item in order.items:
                    product = self.db.get(Product, item.product_id, with_for_update=True)
                    if product:
                        product.stock_quantity = product.stock_quantity + item.quantity
            order.status = OrderStatus.CANCELLED
            self.db.commit()
            self.db.refresh(order)
            return order
        except HTTPException:
            self.db.rollback()
            raise
        except Exception:
            self.db.rollback()
            raise
