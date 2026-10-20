import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getToken } from '../utils/auth';
// import axios from 'axios';

const CreateQuestPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 3,
    reward_points: 10,
    type: 'daily',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Валидация
    if (!formData.title.trim()) { setError('Название обязательно'); setLoading(false); return; }
    if (formData.title.length > 100) { setError('До 100 символов'); setLoading(false); return; }
    if (!formData.description.trim()) { setError('Описание обязательно'); setLoading(false); return; }
    if (formData.description.length > 500) { setError('До 500 символов'); setLoading(false); return; }

    const difficulty = Number(formData.difficulty);
    if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) { setError('Сложность 1–5'); setLoading(false); return; }

    const reward = Number(formData.reward_points);
    if (isNaN(reward) || reward < 1 || reward > 500) { setError('Награда 1–500'); setLoading(false); return; }

    console.log('Отправка квеста:', formData);
    /*
    // ЭМУЛЯЦИЯ
    setTimeout(() => {
      alert('Квест создан (демо-режим)!');
      setLoading(false);
      navigate('/dashboard');
    }, 800);
    */
    
    // РЕАЛЬНЫЙ ВАРИАНТ:
    try {
      await fetch('http://localhost:8000/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });
      alert('Квест успешно создан!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Не удалось создать квест');
      setLoading(false);
    }
    
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Создать квест</h1>
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Название</label>
          <input
            type="text" name="title" value={formData.title} onChange={handleChange}
            placeholder="Например: «Пройти 10 000 шагов»"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Описание</label>
          <textarea
            name="description" value={formData.description} onChange={handleChange} rows="4"
            placeholder="Что нужно сделать?"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Сложность (1–5)</label>
          <select
            name="difficulty" value={formData.difficulty} onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Награда (очки)</label>
          <input
            type="number" name="reward_points" value={formData.reward_points} onChange={handleChange}
            min="1" max="500"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Тип квеста</label>
          <select
            name="type" value={formData.type} onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
          >
            <option value="daily">Ежедневный</option>
            <option value="weekly">Еженедельный</option>
            <option value="one-time">Разовый</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#6a5acd',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Создание...' : 'Создать квест'}
        </button>
      </form>
    </div>
  );
};

export default CreateQuestPage;