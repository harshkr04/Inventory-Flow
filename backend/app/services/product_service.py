from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models import Product
from ..repositories.product_repo import ProductRepository
from ..schemas import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ProductRepository(db)

    def list(self, q, page, page_size):
        return self.repo.list(q, page, page_size)

    def get(self, pid: int) -> Product:
        product = self.repo.get(pid)
        if not product:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
        return product

    def create(self, data: ProductCreate) -> Product:
        if self.repo.get_by_sku(data.sku):
            raise HTTPException(status.HTTP_409_CONFLICT, "SKU already exists")
        product = Product(**data.model_dump())
        self.repo.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, pid: int, data: ProductUpdate) -> Product:
        product = self.get(pid)
        payload = data.model_dump(exclude_unset=True)
        if "sku" in payload and payload["sku"] != product.sku:
            if self.repo.get_by_sku(payload["sku"]):
                raise HTTPException(status.HTTP_409_CONFLICT, "SKU already exists")
        for k, v in payload.items():
            setattr(product, k, v)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, pid: int) -> None:
        product = self.get(pid)
        self.repo.delete(product)
        self.db.commit()
