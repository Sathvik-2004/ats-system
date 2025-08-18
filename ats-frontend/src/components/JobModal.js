import React from 'react';
export default function JobModal({ job, onClose }) {
  if (!job) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#2563eb', cursor: 'pointer' }}>×</button>
        <h2 style={{ marginBottom: 16 }}>{job.title}</h2>
        <div><strong>Description:</strong> {job.description || 'No description provided.'}</div>
        <div><strong>Location:</strong> {job.location || 'N/A'}</div>
        <div><strong>Type:</strong> {job.type || 'N/A'}</div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
