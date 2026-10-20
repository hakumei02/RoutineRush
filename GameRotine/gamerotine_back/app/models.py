from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey
from datetime import datetime
from .db import Base
from sqlalchemy.orm import relationship

class Task(Base): # база заданий
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True) # id задания
    title = Column(String(300), nullable=False) # заглавие
    description = Column(Text, nullable=True) # описание
    completed = Column(Boolean, nullable=False, default=False) # 
    deadline = Column(DateTime, nullable=True)  # срок выполнения
    priority = Column(Enum("low", "medium", "high", name="task_priority"), nullable=True)  # приоритет
    category = Column(String(100), nullable=True)  # категория

    # Связь с пользователем
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="tasks")

class User(Base): # база пользователей
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True) # id пользователя 
    username = Column(String(300), unique=True, nullable=False) # логин
    email = Column(String(100), unique=True, index=True, nullable=False)  # почта
    password_hash = Column(String, nullable=False) # пароль
    role = Column(String, nullable=False)    # Роль

    # Обратная связь: все задачи пользователя
    tasks = relationship("Task", back_populates="owner")

class DailyTask(Base):
    __tablename__ = "daily_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)  # Флаг активности
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False) # Не забудь импортировать datetime
    reset_time = Column(DateTime, nullable=True) # Время следующего сброса задания
    streak = Column(Integer, default=0, nullable=False) # Серия дней подряд
    
    # Можно добавить те же поля, что и у обычной задачи, если нужно, или оставить специфичными
    priority = Column(
        Enum("low", "medium", "high", name="task_priority"), # Переиспользуем тот же тип Enum
        nullable=True
    )

    # Связь с пользователем
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User")