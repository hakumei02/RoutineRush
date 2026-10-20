import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, removeToken } from '../utils/auth';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = getUser();

  // --- Авторизация ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const logout = () => {
    removeToken();
    navigate('/login');
  };

  // --- Состояние ---
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newTaskText, setNewTaskText] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3500);
  };

  // --- Нормализация задачи из ответа бэкенда ---
  const normalizeTask = (raw) => ({
    ...raw,
    text: raw.title,
    // Бэкенд хранит completed (bool), а фронт работает со status (string)
    status: raw.completed ? 'done' : 'todo',
  });

  // --- HTTP-помощники ---
  const api = async (endpoint, options = {}) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = `/api${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errData = {};
      try {
        errData = await res.json();
      } catch (e) {
        errData = { detail: `HTTP ${res.status}` };
      }
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }

    // 204 для DELETE
    if (res.status === 204) return null;
    return res.json();
  };

  // --- Загрузка задач ---
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await api('/tasks');
        const rawTasks = Array.isArray(data) ? data : (data.data || data.results || []);
        // ВАЖНО: нормализуем каждую задачу при загрузке
        const normalizedTasks = rawTasks.map(normalizeTask);
        setTasks(normalizedTasks);
      } catch (e) {
        if (e.message.includes('401') || e.message === 'Not authenticated') {
          removeToken();
          navigate('/login');
        } else {
          console.error('Ошибка загрузки задач:', e);
          setError('Не удалось загрузить задачи. Проверьте авторизацию.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // --- Добавление задачи ---
  const addTask = async () => {
    if (!newTaskText.trim()) return;

    try {
      const newTask = await api('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskText.trim(),
          description: '',
          deadline: null,
          priority: 'low',
          category: null,
        }),
      });

      setTasks((prev) => [...prev, normalizeTask(newTask)]);
      setNewTaskText('');
      showNotification('Задача создана!');
    } catch (e) {
      console.error(e);
      showNotification('Ошибка при создании задачи');
    }
  };

  // --- Удаление задачи ---
  const deleteTask = async (taskId) => {
    try {
      await api(`/tasks/${taskId}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showNotification('Задача удалена');
    } catch (e) {
      console.error(e);
      showNotification('Не удалось удалить задачу');
    }
  };

  // --- Drag-and-drop хендлеры ---
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', String(taskId));
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (status) => {
    setDragOverColumn(status);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    setDraggedTaskId(null);

    const taskId = Number(e.dataTransfer.getData('taskId'));
    const task = tasks.find((t) => t.id === taskId);

    if (!task || task.status === targetStatus) return;

    try {
      await api(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: targetStatus === 'done' }),
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus, completed: targetStatus === 'done' } : t))
      );

      if (targetStatus === 'done') {
        showNotification(`Ты молодец! Задача «${task.text}» выполнена! 😌`);
      }
    } catch (e) {
      console.error(e);
      showNotification('Не удалось обновить статус задачи');
    }
  };

  // --- Статистика и достижения ---
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const achievements = [
    { icon: '👣', title: 'Первые шаги', desc: 'Создай первую задачу', unlocked: totalTasks >= 1 },
    { icon: '🤟', title: 'В разгаре', desc: 'Выполни 3 задачи', unlocked: doneTasks >= 3 },
    { icon: '🕶', title: 'Профи', desc: 'Выполни 5 задач', unlocked: doneTasks >= 5 },
    { icon: '🥇', title: 'Чемпион', desc: 'Выполни 10 задач', unlocked: doneTasks >= 10 },
  ];

  if (loading) {
    return (
      <div className="main-page">
        <header className="app-header">
          <h1>RoutineRush 📌</h1>
        </header>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Загрузка задач...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-page">
        <header className="app-header">
          <h1>RoutineRush 📌</h1>
          <button className="nav-btn" onClick={logout}>Выйти</button>
        </header>
        <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page">
      <header className="app-header">
        <h1>RoutineRush 📌</h1>
        <div className="header-buttons">
          <span>{currentUser ? `Привет, ${currentUser.username}!` : 'Привет, друг!'}</span>
          <button className="nav-btn" onClick={logout}>
            Выйти
          </button>
        </div>
      </header>

      <div className="progress-tracker">
        <div style={{ flex: 1 }}>
          <p>Общий прогресс: {progress}%</p>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                background: progress >= 70 ? '#4caf50' : '#A4C6E9',
              }}
            />
          </div>
        </div>
        <div className="progress-stats">
          <div>
            <span>Всего</span>
            <strong>{totalTasks}</strong>
          </div>
          <div>
            <span>Выполнено</span>
            <strong style={{ color: '#4caf50' }}>{doneTasks}</strong>
          </div>
        </div>
      </div>

      <div className="kanban-board">
        {[
          { id: 'todo', title: 'Нужно сделать' },
          { id: 'in_progress', title: 'В работе' },
          { id: 'done', title: 'Готово' },
        ].map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isDragOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={`column ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-header">
                <h3>{col.title}</h3>
                <span className="task-count">{colTasks.length}</span>
              </div>

              {col.id === 'todo' && (
                <div className="add-task-form">
                  <input
                    type="text"
                    className="add-task-input"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Что нужно сделать?"
                    maxLength={80}
                  />
                  <button
                    className="add-task-btn"
                    onClick={addTask}
                    disabled={!newTaskText.trim()}
                  >
                    ➕
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {colTasks.length === 0 ? (
                  <div className="empty-state">
                    {totalTasks === 0 ? (
                      <>
                        <div className="emoji">📓</div>
                        <p>Задач пока нет</p>
                        <p className="add-hint">
                          Напишите задачу в поле и нажмите «+»
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="emoji">👉</div>
                        <p>Перетащите</p>
                      </>
                    )}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-card ${draggedTaskId === task.id ? 'dragging' : ''} ${task.status === 'done' ? 'completed' : ''}`}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      <div className="task-text">
                        {task.status === 'done' && '🤩'}
                        {task.text}
                      </div>
                      <div className="task-meta">
                        <span className="task-date">{task.createdAt}</span>
                        <button
                          className="delete-btn"
                          onClick={() => deleteTask(task.id)}
                          title="Удалить"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="achievements-section">
        <h2>🌸Достижения🌸</h2>
        <div className="achievements-grid">
          {achievements.map((ach, idx) => (
            <div
              key={idx}
              className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
            >
              <span className="achievement-icon">{ach.icon}</span>
              <div className="achievement-info">
                <h4>{ach.title}</h4>
                <p>{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {notification && (
        <div className="notification">
          <span>💖</span>
          <span>{notification}</span>
          <button className="close-btn" onClick={() => setNotification(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;