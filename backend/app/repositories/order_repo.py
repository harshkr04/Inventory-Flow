from typing import Optional, Tuple, List
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..models import Order, OrderStatus


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, oid: int) -> Optional[Order]:
        return self.db.get(Order, oid)

    def list(self, status: Optional[OrderStatus], page: int, page_size: int) -> Tuple[List[Order], int]:
        stmt = select(Order)
        count_stmt = select(func.count(Order.id))
        if status:
            stmt = stmt.where(Order.status == status)
            count_stmt = count_stmt.where(Order.status == status)
        total = self.db.scalar(count_stmt) or 0
        items = list(self.db.scalars(
            stmt.order_by(Order.order_date.desc()).offset((page - 1) * page_size).limit(page_size)
        ).all())
        return items, total

    def add(self, order: Order) -> Order:
        self.db.add(order)
        self.db.flush()
        return order
