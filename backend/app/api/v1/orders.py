from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...models import OrderStatus
from ...schemas import OrderCreate, OrderOut, OrderPage, OrderItemOut
from ...services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


def _to_out(o) -> OrderOut:
    return OrderOut(
        id=o.id,
        customer_id=o.customer_id,
        customer_name=(f"{o.customer.first_name} {o.customer.last_name}" if o.customer else None),
        order_date=o.order_date,
        total_amount=float(o.total_amount),
        status=o.status,
        items=[
            OrderItemOut(
                id=it.id,
                product_id=it.product_id,
                product_name=(it.product.name if it.product else None),
                quantity=it.quantity,
                unit_price=float(it.unit_price),
                subtotal=float(it.subtotal),
            ) for it in o.items
        ],
    )


@router.get("", response_model=OrderPage)
def list_orders(
    status: OrderStatus | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = OrderService(db).list(status, page, page_size)
    return OrderPage(items=[_to_out(o) for o in items], total=total, page=page, page_size=page_size)


@router.get("/{oid}", response_model=OrderOut)
def get_order(oid: int, db: Session = Depends(get_db)):
    return _to_out(OrderService(db).get(oid))


@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    return _to_out(OrderService(db).create(payload))


@router.put("/{oid}/cancel", response_model=OrderOut)
def cancel_order(oid: int, db: Session = Depends(get_db)):
    return _to_out(OrderService(db).cancel(oid))


@router.delete("/{oid}", status_code=204)
def delete_order(oid: int, db: Session = Depends(get_db)):
    """Cancel/Delete an order and restore inventory stock."""
    OrderService(db).cancel(oid)
    return None

