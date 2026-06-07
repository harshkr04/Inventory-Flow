from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...models import Product
from ...schemas import ProductOut
from ...repositories.product_repo import ProductRepository

router = APIRouter(prefix="/inventory", tags=["inventory"])


class StockAdjustment(BaseModel):
    adjustment: int  # positive to add, negative to subtract


class InventoryItem(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    stock_quantity: int

    class Config:
        from_attributes = True


class InventoryList(BaseModel):
    items: list[InventoryItem]
    total: int


@router.get("", response_model=InventoryList)
def list_inventory(db: Session = Depends(get_db)):
    """List all products with their stock levels."""
    repo = ProductRepository(db)
    items, total = repo.list(q=None, page=1, page_size=1000)
    return InventoryList(
        items=[
            InventoryItem(
                id=p.id,
                name=p.name,
                sku=p.sku,
                price=float(p.price),
                stock_quantity=p.stock_quantity,
            )
            for p in items
        ],
        total=total,
    )


@router.patch("/{product_id}", response_model=ProductOut)
def adjust_stock(product_id: int, payload: StockAdjustment, db: Session = Depends(get_db)):
    """Adjust stock for a product by a delta amount."""
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")

    new_qty = product.stock_quantity + payload.adjustment
    if new_qty < 0:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Cannot reduce stock below 0. Current: {product.stock_quantity}, adjustment: {payload.adjustment}",
        )

    product.stock_quantity = new_qty
    db.commit()
    db.refresh(product)
    return product
