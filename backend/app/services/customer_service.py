from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models import Customer
from ..repositories.customer_repo import CustomerRepository
from ..schemas import CustomerCreate, CustomerUpdate


class CustomerService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CustomerRepository(db)

    def list(self, q, page, page_size):
        return self.repo.list(q, page, page_size)

    def get(self, cid: int) -> Customer:
        c = self.repo.get(cid)
        if not c:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
        return c

    def create(self, data: CustomerCreate) -> Customer:
        if self.repo.get_by_email(data.email):
            raise HTTPException(status.HTTP_409_CONFLICT, "Email already exists")
        c = Customer(**data.model_dump())
        self.repo.add(c)
        self.db.commit()
        self.db.refresh(c)
        return c

    def update(self, cid: int, data: CustomerUpdate) -> Customer:
        c = self.get(cid)
        payload = data.model_dump(exclude_unset=True)
        if "email" in payload and payload["email"] != c.email:
            if self.repo.get_by_email(payload["email"]):
                raise HTTPException(status.HTTP_409_CONFLICT, "Email already exists")
        for k, v in payload.items():
            setattr(c, k, v)
        self.db.commit()
        self.db.refresh(c)
        return c

    def delete(self, cid: int) -> None:
        c = self.get(cid)
        self.repo.delete(c)
        self.db.commit()
