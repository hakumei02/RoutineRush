import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../utils/auth';

const API_URL = 'http://localhost:8000';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = formData.username.trim();
    const pass = formData.password.trim();

    if (!user || !pass) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    // Реальный запрос к бэкенду
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.detail || data.message || 'Неверный логин или пароль';
        setError(message);
        return;
      }

      const data = await res.json();
      const token = data.access_token;
      if (!token) {
        throw new Error('Бэкенд не вернул токен');
      }

      setToken(token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: `url(/images/login-bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#4a008a',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '28px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '16px',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h2 style={{ textAlign: 'center', color: '#000', margin: 0 }}>
          Авторизация
        </h2>

        {error && (
          <div
            style={{
              color: 'red',
              marginBottom: '16px',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Имя пользователя"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                backgroundColor: loading ? '#555' : '#333',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Пароль"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                backgroundColor: loading ? '#555' : '#333',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#8b7bbd' : '#6a5acd',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Нет аккаунта?{' '}
          </span>
          <span
            onClick={() => !loading && navigate('/register')}
            style={{
              color: '#6a5acd',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '16px',
            }}
          >
            Зарегистрироваться
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
