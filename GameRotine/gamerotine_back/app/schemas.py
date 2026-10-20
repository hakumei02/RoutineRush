from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

# Схема приоритетов
class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high" 

# Базовая схема — содержит обязательные и опциональные поля для задачи
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
 
# Схема для создания новой задачи (наследует базовые поля)
class TaskCreate(TaskBase):
    title: str
    description: str
    deadline: datetime | None = None
    priority: TaskPriority | None = None
    category: str | None = None

# Схема для обновления задачи — позволяет частично изменять поля
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

# Схема, описывающая задачу в базе данных (включает ID и статус)
class TaskInDBBase(TaskBase):
    id: int
    completed: bool

    class Config:
        from_attributes = True  # Позволяет Pydantic работать с ORM‑объектами SQLAlchemy

# Финальная схема для возврата данных клиенту (наследует поля из TaskInDBBase)
class TaskOut(TaskInDBBase):
    id: int
    title: str
    description: str
    completed: bool
    deadline: datetime | None
    priority: TaskPriority | None
    category: str | None

class DailyTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_active: bool = True
    reset_time: Optional[datetime] = None
    streak: int = 0
    priority: Optional[TaskPriority] = None

class DailyTaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    reset_time: Optional[datetime] = None
    streak: int
    priority: Optional[TaskPriority] = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str      # Сюда клиент шлет либо username, либо email
    password: str