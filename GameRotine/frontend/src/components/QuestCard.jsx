import React from 'react';

const QuestCard = ({ quest, onComplete, isCompleted }) => {
  const handleComplete = async () => {
    await onComplete(quest.id);
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: isCompleted ? '2px solid #4caf50' : '1px solid #ddd'
    }}>
      <div>
        <h3 style={{ margin: 0, color: '#333' }}>{quest.title}</h3>
        <p style={{ margin: '6px 0 0', color: '#666', fontSize: '14px' }}>{quest.description}</p>
        {isCompleted && <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✅ Выполнено</span>}
      </div>

      {!isCompleted && (
        <button
          onClick={handleComplete}
          style={{
            backgroundColor: '#6a5acd',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Выполнить
        </button>
      )}
      {isCompleted && (
        <span style={{ color: '#aaa' }}>✔️</span>
      )}
    </div>
  );
};

export default QuestCard;