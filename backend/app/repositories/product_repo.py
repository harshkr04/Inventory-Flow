from typing import Optional, Tuple, List
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from ..models import Product


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, product_id: int) -> Optional[Product]:
        return self.db.get(Product, product_id)

    def get_by_sku(self, sku: str) -> Optional[Product]:
        return self.db.scalar(select(Product).where(Product.sku == sku))

    def list(self, q: Optional[str], page: int, page_size: int) -> Tuple[List[Product], int]:
        stmt = select(Product)
        count_stmt = select(func.count(Product.id))
        if q:
            like = f"%{q}%"
            cond = or_(Product.name.ilike(like), Product.sku.ilike(like))
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)
        total = self.db.scalar(count_stmt) or 0
        items = list(self.db.scalars(
            stmt.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        ).all())
        return items, total

    def add(self, product: Product) -> Product:
        self.db.add(product)
        self.db.flush()
        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.flush()
