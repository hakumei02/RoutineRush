import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

# 1. Вычисляем путь к .env относительно этого файла (main.py)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
# 2. Загружаем переменные
load_dotenv(dotenv_path=env_path)

# Проверка (опционально): можно убрать после успешного запуска
if not os.getenv("SECRET_KEY"):
    raise RuntimeError(f"Не удалось загрузить .env! Путь: {env_path}")

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import schemas
from . import crud
from . import models
from .security import create_access_token, verify_password
from .db import SessionLocal, engine, Base
from typing import List

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from .security import SECRET_KEY, ALGORITHM  # важно: импортируем из security.py

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Зависимость: предоставляет сессию БД для каждого запроса
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    print(f"\n=== ОТЛАДКА get_current_user ===")
    print(f"Полученный токен: {token[:50]}...")
    print(f"SECRET_KEY на сервере: '{SECRET_KEY}'")
    print(f"ALGORITHM: {ALGORITHM}")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        print(f"Декодирование OK! user_id = {user_id}")
        if user_id is None:
            print("user_id is None!")
            raise credentials_exception
    except JWTError as e:
        print(f"JWTError: {e}")
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    print(f"Пользователь из БД: {user}")
    if user is None:
        print("Пользователь не найден в БД!")
        raise credentials_exception
    return user

# Инициализация приложения FastAPI
app = FastAPI(title="Tasks API")

@app.middleware("http")
async def debug_headers(request, call_next):
    print(f"\n=== ВХОДЯЩИЕ ЗАГОЛОВКИ: {request.method} {request.url.path} ===")
    for key, value in request.headers.items():
        print(f"  {key}: {value}")
    response = await call_next(request)
    return response

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DEBUG-эндпоинт для очистки пользователей
@app.post("/debug/clear-all")
def debug_clear_all(db: Session = Depends(get_db)):
    # Проверка режима разработки для безопасности
    if os.getenv("DEV") != "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен. Установите DEV=true в .env"
        )
    
    print("⚠️  Запуск полной очистки базы данных...")
    
    # Сначала удаляем задачи (так как они зависят от пользователей по owner_id)
    # synchronize_session=False ускоряет удаление, игнорируя отслеживание сессии
    tasks_count = db.query(models.Task).delete(synchronize_session=False)
    print(f"Удалено задач: {tasks_count}")
    
    # Затем удаляем пользователей
    users_count = db.query(models.User).delete(synchronize_session=False)
    print(f"Удалено пользователей: {users_count}")
    
    # Сохраняем изменения в БД
    db.commit()
    
    return {
        "message": "База данных очищена от тестовых данных",
        "deleted_users": users_count,
        "deleted_tasks": tasks_count
    }

# Создание таблиц в БД
Base.metadata.create_all(bind=engine)

# Эндпоинт для регистрации (теперь возвращает токен)
@app.post("/register")
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, email=user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud.get_user_by_username(db, username=user_in.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    user = crud.create_user(db=db, user_in=user_in)
    
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=60)
    )
    
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        },
        "access_token": access_token,
        "token_type": "bearer"
    }

# Эндпоинт для авторизации (теперь возвращает токен)
@app.post("/login")
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_login(db, login_data.username)
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=60)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

# Эндпоинт для создания новой задачи
@app.post("/tasks", response_model=schemas.TaskOut)
def create_task_endpoint(
    task_in: schemas.TaskCreate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_task(db=db, task_in=task_in, owner_id=current_user.id)

# Эндпоинт для получения списка задач (с пагинацией)
@app.get("/tasks", response_model=List[schemas.TaskOut])
def list_tasks(
    skip: int = 0, 
    limit: int = 100,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return crud.get_tasks(db=db, user_id=current_user.id, skip=skip, limit=limit)

# Эндпоинт для получения конкретной задачи по ID
@app.get("/tasks/{task_id}", response_model=schemas.TaskOut)
def read_task(
    task_id: int,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# Эндпоинт для обновления задачи
@app.patch("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task_endpoint(
    task_id: int, 
    task_in: schemas.TaskUpdate,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return crud.update_task(db=db, task=task, task_in=task_in)

# Эндпоинт для удаления задачи
@app.delete("/tasks/{task_id}", status_code=204)
def delete_task_endpoint(
    task_id: int,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()
     
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    crud.delete_task(db=db, task=task)
    return None

# Эндпоинт для работы с дейликами
@app.post("/daily-tasks", response_model=schemas.DailyTaskOut)
def create_daily_task_endpoint(
    daily_task_in: schemas.DailyTaskCreate,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return crud.create_daily_task(db=db, daily_task_in=daily_task_in, owner_id=current_user.id)

@app.get("/daily-tasks", response_model=List[schemas.DailyTaskOut])
def list_active_daily_tasks(
    skip: int = 0, 
    limit: int = 100,
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return crud.get_active_daily_tasks(db=db, user_id=current_user.id, skip=skip, limit=limit)

@app.get("/debug/check-user/{user_id}")
def debug_check_user(user_id: int, db: Session = Depends(get_db)):
    if os.getenv("DEV") != "true":
        raise HTTPException(status_code=403, detail="DEV=true required")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"exists": False}
    return {
        "exists": True,
        "id": user.id,
        "username": user.username,
        "email": user.email
    }