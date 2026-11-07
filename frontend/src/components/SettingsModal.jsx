import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Cpu, Clock, ShieldCheck, Database } from 'lucide-react';
import api from '../services/api';

export default function SettingsModal({ isOpen, onClose }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.checkHealth()
        .then(data => setHealth(data))
        .catch(() => setHealth({ status: 'offline', ai_provider: 'fallback_engine', target_lesson_duration: 45 }))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
            System Architecture & AI Status
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Cpu size={18} color="#4f46e5" />
              <strong style={{ fontSize: '15px' }}>Active AI Engine</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#334155' }}>
              {health?.ai_provider === 'gemini' && 'Google Gemini 1.5 Flash (Live API)'}
              {health?.ai_provider === 'openai' && 'OpenAI GPT-4o Mini (Live API)'}
              {health?.ai_provider === 'fallback_engine' && 'Intelligent Educational Synthesis Engine (Local / Zero-Failure Fallback)'}
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              The system supports live Google Gemini and OpenAI keys via <code>backend/.env</code>, and includes a deterministic domain synthesis engine for 100% offline uptime and instant evaluation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
                <Clock size={16} /> Target Lesson Duration
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                {health?.target_lesson_duration || 45} Minutes
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
                <ShieldCheck size={16} /> Quality Control Layers
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                2 Independent Layers
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '6px' }}>
              <Database size={16} /> Local Persistence
            </div>
            <div style={{ fontSize: '13px', color: '#334155' }}>
              All generated lessons, instructor edits, and separate audit reports persist in atomic JSON storage in <code>backend/data/lessons.json</code>.
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
