from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str) -> models.User | None:
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_login(db: Session, login_value: str) -> models.User | None:
    # Сначала пробуем найти по username
    user = db.query(models.User).filter(models.User.username == login_value).first()
    
    # Если не нашли, пробуем по email
    if not user:
        user = db.query(models.User).filter(models.User.email == login_value).first()
        
    return user

# Создание пользователя
def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    # Импортируем функцию хеширования из security.py
    from .security import get_password_hash
    
    hashed_password = get_password_hash(user_in.password)
    
    user = models.User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_password,
        role="user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Получение списка задач (с фильтром)
def get_task(db: Session, task_id: int) -> models.Task | None:
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def get_tasks(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    category: str | None = None
) -> list[models.Task]:
    query = db.query(models.Task).filter(models.Task.owner_id == user_id)
    if category:
        query = query.filter(models.Task.category == category)
    return query.offset(skip).limit(limit).all()

# Создание задачи
def create_task(db: Session, task_in: schemas.TaskCreate, owner_id: int) -> models.Task:
    task = models.Task(
        title=task_in.title,
        description=task_in.description,
        deadline=task_in.deadline,
        priority=task_in.priority,
        category=task_in.category,
        completed=False,
        owner_id=owner_id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

# Обновление задачи
def update_task(
    db: Session,
    task: models.Task,
    task_in: schemas.TaskUpdate
) -> models.Task:
    update_data = task_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task

# Дейлики
# Создание дейлика
def create_daily_task(db: Session, daily_task_in: schemas.DailyTaskCreate, owner_id: int) -> models.DailyTask:
    data = daily_task_in.model_dump()

    daily_task = models.DailyTask(**data, owner_id=owner_id)
    db.add(daily_task)
    db.commit()
    db.refresh(daily_task)
    return daily_task

# Удаление задачи
def delete_task(db: Session, task: models.Task) -> None:
    db.delete(task)
    db.commit()

# Выбор активного дейлика
def get_active_daily_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.DailyTask]:
    return (
        db.query(models.DailyTask)
        .filter(
            models.DailyTask.is_active == True,
            models.DailyTask.owner_id == user_id
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
