\# RoutineRush



Приложение для управления рутинами и задачами с трекингом прогресса.



\## Стек технологий

\- Python 3.11+

\- FastAPI

\- SQLAlchemy + Alembic

\- SQLite 

\- Pydantic

\- Uvicorn



\## Установка и запуск (локально)



1\. Клонируй репозиторий:  

&#x20;  `git clone <URL-репозитория>`

2\. Перейди в директорию проекта:  

&#x20;  `cd D:\\akademia\\Dip`

3\. Создай виртуальное окружение:  

&#x20;  `python -m venv venv`

4\. Активируй виртуальное окружение (PowerShell):  

&#x20;  `venv\\Scripts\\Activate.ps1`

5\. Установи зависимости:  

&#x20;  `pip install -r requirements.txt`

6\. Скопируй шаблон переменных окружения:  

&#x20;  `Copy-Item .env.example .env`

7\. Заполни файл `.env` актуальными значениями.

8\. Примени миграции БД:  

&#x20;  `alembic upgrade head`

9\. Запусти приложение:  

&#x20;  `uvicorn main:app --reload --host 0.0.0.0 --port 8000`



\## Переменные окружения



| Переменная | Описание | Пример значения |

| --- | --- | --- |

| `SECRET\_KEY` | Секретный ключ для криптографических операций | `super\_secret\_key\_change\_in\_prod` |

| `ALGORITHM` | Алгоритм хеширования для JWT | `HS256` |

| `ACCESS\_TOKEN\_EXPIRE\_MINUTES` | Время жизни access-токена (в минутах) | `30` |

| `DATABASE\_URL` | Строка подключения к БД | `sqlite:///./routinerush.db` или `postgresql://user:password@localhost/dbname` |

| `DEBUG` | Режим отладки (`true`/`false`) | `true` |



\## API эндпоинты (базовые)



\- `GET /` — проверка доступности сервиса.

\- `POST /auth/login` — авторизация пользователя.

\- `GET /tasks` — получение списка задач.

\- `POST /tasks` — создание новой задачи.



\## Миграции базы данных



\- Создать новую миграцию:  

&#x20; `alembic revision -m "Описание миграции"`

\- Применить все миграции:  

&#x20; `alembic upgrade head`

\- Откатить последнюю миграцию:  

&#x20; `alembic downgrade -1`



\## Деплой



Проект совместим с платформами: Render, Railway, Fly.io.  



1\. Загрузи репозиторий на выбранную платформу.

2\. В настройках укажи:

&#x20;  - Build Command: `pip install -r requirements.txt`

&#x20;  - Start Command: `uvicorn main:app --host 0.0.0.0 --port \\$PORT`

3\. Добавь переменные окружения из таблицы выше в панель управления платформы (не загружай файл `.env` в репозиторий).

4\. Убедись, что команда миграции БД выполняется до старта приложения (через `Procfile` или скрипт запуска).



\## Лицензия



MIT License .



