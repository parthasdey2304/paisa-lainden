import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>
        <div style={{ margin: '1.5rem 0', color: 'var(--text-color)' }}>
          <p>{message}</p>
        </div>
        <div className="flex gap-4 mt-4" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: 'white' }} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;