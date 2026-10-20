import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const LeaderboardPage = () => {
  const navigate = useNavigate();

  // Моковые данные (заменить на fetch к /api/leaderboard)
  const leaderboard = [
    { username: 'alex_dev', points: 142 },
    { username: 'maria_ux', points: 130 },
    { username: 'ivan_test', points: 98 },
  ];

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Рейтинг</h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 16px', background: '#eee', border: '1px solid #ccc', borderRadius: '6px' }}
        >
          Назад
        </button>
      </header>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Место</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Пользователь</th>
            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Очки</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, idx) => (
            <tr key={user.username} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{idx + 1}</td>
              <td style={{ padding: '12px' }}>{user.username}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{user.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardPage;