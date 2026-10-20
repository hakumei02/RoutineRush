import React from 'react';

const NotificationToast = ({ message, onClose }) => (
  <div style={{
    position: 'fixed', bottom: '20px', right: '20px',
    background: '#4caf50', color: '#fff', padding: '16px 24px',
    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 9999
  }}>
    <span>{message}</span>
    <button
      onClick={onClose}
      style={{ background: 'none', border: 'none', color: '#fff', marginLeft: '12px', cursor: 'pointer', fontWeight: 'bold' }}
    >
      ×
    </button>
  </div>
);

export default NotificationToast;