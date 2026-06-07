from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...schemas import CustomerCreate, CustomerUpdate, CustomerOut, CustomerPage
from ...services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=CustomerPage)
def list_customers(
    q: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = CustomerService(db).list(q, page, page_size)
    return CustomerPage(items=[CustomerOut.model_validate(i) for i in items], total=total, page=page, page_size=page_size)


@router.get("/{cid}", response_model=CustomerOut)
def get_customer(cid: int, db: Session = Depends(get_db)):
    return CustomerService(db).get(cid)


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    return CustomerService(db).create(payload)


@router.put("/{cid}", response_model=CustomerOut)
def update_customer(cid: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    return CustomerService(db).update(cid, payload)


@router.delete("/{cid}", status_code=204)
def delete_customer(cid: int, db: Session = Depends(get_db)):
    CustomerService(db).delete(cid)
    return None
