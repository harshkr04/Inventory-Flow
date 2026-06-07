from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..models import Product, Customer, Order, OrderItem, OrderStatus
from ..schemas import (
    DashboardSummary, MonthlyPoint, TopProduct, InventoryBucket, RecentOrder, LowStockItem
)

LOW_STOCK_THRESHOLD = 10


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def summary(self) -> DashboardSummary:
        db = self.db

        total_products = db.scalar(select(func.count(Product.id))) or 0
        total_customers = db.scalar(select(func.count(Customer.id))) or 0
        total_orders = db.scalar(select(func.count(Order.id)).where(Order.status != OrderStatus.CANCELLED)) or 0
        total_revenue = float(db.scalar(
            select(func.coalesce(func.sum(Order.total_amount), 0)).where(Order.status != OrderStatus.CANCELLED)
        ) or 0)

        low_stock_q = select(Product).where(Product.stock_quantity <= LOW_STOCK_THRESHOLD).order_by(Product.stock_quantity.asc()).limit(10)
        low_stock_rows = list(db.scalars(low_stock_q).all())
        low_stock_items = [LowStockItem(id=p.id, name=p.name, sku=p.sku, stock_quantity=p.stock_quantity) for p in low_stock_rows]
        low_stock_count = db.scalar(select(func.count(Product.id)).where(Product.stock_quantity <= LOW_STOCK_THRESHOLD)) or 0

        recent_orders_rows = list(db.scalars(select(Order).order_by(Order.order_date.desc()).limit(8)).all())
        recent_orders = [
            RecentOrder(
                id=o.id,
                customer_name=f"{o.customer.first_name} {o.customer.last_name}" if o.customer else "—",
                total_amount=float(o.total_amount),
                status=o.status,
                order_date=o.order_date,
            ) for o in recent_orders_rows
        ]

        # Monthly: last 6 months
        now = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        months = []
        for i in range(5, -1, -1):
            year = now.year
            month = now.month - i
            while month <= 0:
                month += 12
                year -= 1
            months.append((year, month))

        monthly: list[MonthlyPoint] = []
        for (y, m) in months:
            start = datetime(y, m, 1, tzinfo=timezone.utc)
            if m == 12:
                end = datetime(y + 1, 1, 1, tzinfo=timezone.utc)
            else:
                end = datetime(y, m + 1, 1, tzinfo=timezone.utc)
            orders_count = db.scalar(
                select(func.count(Order.id)).where(Order.order_date >= start, Order.order_date < end, Order.status != OrderStatus.CANCELLED)
            ) or 0
            revenue = float(db.scalar(
                select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                    Order.order_date >= start, Order.order_date < end, Order.status != OrderStatus.CANCELLED
                )
            ) or 0)
            monthly.append(MonthlyPoint(month=start.strftime("%b %Y"), orders=orders_count, revenue=revenue))

        # Top products by qty sold
        top_rows = db.execute(
            select(
                OrderItem.product_id,
                Product.name,
                func.sum(OrderItem.quantity).label("qty"),
                func.sum(OrderItem.subtotal).label("rev"),
            )
            .join(Product, Product.id == OrderItem.product_id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.status != OrderStatus.CANCELLED)
            .group_by(OrderItem.product_id, Product.name)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(5)
        ).all()
        top_products = [TopProduct(product_id=r[0], name=r[1], quantity_sold=int(r[2] or 0), revenue=float(r[3] or 0)) for r in top_rows]

        # Inventory distribution buckets
        buckets = [
            ("Out of stock", 0, 0),
            ("Low (1-10)", 1, 10),
            ("Medium (11-50)", 11, 50),
            ("High (51-200)", 51, 200),
            ("Bulk (200+)", 201, 10**9),
        ]
        inv: list[InventoryBucket] = []
        for label, lo, hi in buckets:
            if lo == 0 and hi == 0:
                cnt = db.scalar(select(func.count(Product.id)).where(Product.stock_quantity == 0)) or 0
            else:
                cnt = db.scalar(select(func.count(Product.id)).where(Product.stock_quantity >= lo, Product.stock_quantity <= hi)) or 0
            inv.append(InventoryBucket(label=label, count=int(cnt)))

        return DashboardSummary(
            total_products=int(total_products),
            total_customers=int(total_customers),
            total_orders=int(total_orders),
            total_revenue=total_revenue,
            low_stock_count=int(low_stock_count),
            recent_orders=recent_orders,
            low_stock_items=low_stock_items,
            monthly=monthly,
            top_products=top_products,
            inventory_distribution=inv,
        )
