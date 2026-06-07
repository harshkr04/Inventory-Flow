from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from ..models.user import UserRole
from ..models.order import OrderStatus


# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=6, max_length=255)
    role: UserRole = UserRole.MANAGER


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    created_at: datetime


# ---------- Product ----------
class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=1, max_length=64)
    description: Optional[str] = Field(default=None, max_length=2000)
    price: float = Field(ge=0)
    stock_quantity: int = Field(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=64)
    description: Optional[str] = Field(default=None, max_length=2000)
    price: Optional[float] = Field(default=None, ge=0)
    stock_quantity: Optional[int] = Field(default=None, ge=0)


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime


class ProductPage(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    page_size: int


# ---------- Customer ----------
class CustomerBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None, max_length=500)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None, max_length=500)


class CustomerOut(CustomerBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class CustomerPage(BaseModel):
    items: List[CustomerOut]
    total: int
    page: int
    page_size: int


# ---------- Order ----------
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(min_length=1)


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    order_date: datetime
    total_amount: float
    status: OrderStatus
    items: List[OrderItemOut] = []


class OrderPage(BaseModel):
    items: List[OrderOut]
    total: int
    page: int
    page_size: int


# ---------- Dashboard ----------
class MonthlyPoint(BaseModel):
    month: str
    orders: int
    revenue: float


class TopProduct(BaseModel):
    product_id: int
    name: str
    quantity_sold: int
    revenue: float


class InventoryBucket(BaseModel):
    label: str
    count: int


class RecentOrder(BaseModel):
    id: int
    customer_name: str
    total_amount: float
    status: OrderStatus
    order_date: datetime


class LowStockItem(BaseModel):
    id: int
    name: str
    sku: str
    stock_quantity: int


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    low_stock_count: int
    recent_orders: List[RecentOrder]
    low_stock_items: List[LowStockItem]
    monthly: List[MonthlyPoint]
    top_products: List[TopProduct]
    inventory_distribution: List[InventoryBucket]


Token.model_rebuild()
