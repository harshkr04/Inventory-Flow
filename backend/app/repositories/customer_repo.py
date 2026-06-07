from typing import Optional, Tuple, List
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from ..models import Customer


class CustomerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, cid: int) -> Optional[Customer]:
        return self.db.get(Customer, cid)

    def get_by_email(self, email: str) -> Optional[Customer]:
        return self.db.scalar(select(Customer).where(Customer.email == email))

    def list(self, q: Optional[str], page: int, page_size: int) -> Tuple[List[Customer], int]:
        stmt = select(Customer)
        count_stmt = select(func.count(Customer.id))
        if q:
            like = f"%{q}%"
            cond = or_(Customer.first_name.ilike(like), Customer.last_name.ilike(like), Customer.email.ilike(like))
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)
        total = self.db.scalar(count_stmt) or 0
        items = list(self.db.scalars(
            stmt.order_by(Customer.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        ).all())
        return items, total

    def add(self, customer: Customer) -> Customer:
        self.db.add(customer)
        self.db.flush()
        return customer

    def delete(self, customer: Customer) -> None:
        self.db.delete(customer)
        self.db.flush()
