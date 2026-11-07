import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Cpu, Clock, ShieldCheck, Database, Contrast, Check } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function SettingsModal({ isOpen, onClose }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme, setTheme, themes } = useTheme();

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
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main, #0f172a)' }}>
            System Architecture & Preferences
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
          {/* Visual Theme Selection (Default vs Black & White) */}
          <div style={{ background: 'var(--slate-50, #f8fafc)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-main, #e2e8f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Contrast size={18} color="var(--primary)" />
              <strong style={{ fontSize: '15px', color: 'var(--text-main, #0f172a)' }}>Theme Customization</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--slate-500, #64748b)', marginBottom: '12px' }}>
              Select your preferred appearance mode: Vibrant Color, Monochrome Paper (B&W Light), or Cyber Noir (B&W Dark).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              {themes.map((t) => {
                const isSelected = t.id === theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className="btn btn-sm"
                    style={{
                      justifyContent: 'flex-start',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-surface, #ffffff)',
                      color: isSelected ? 'var(--bg-surface, #ffffff)' : 'var(--text-main, #0f172a)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-main, #e2e8f0)',
                      padding: '10px 12px'
                    }}
                  >
                    <span>{t.icon}</span>
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: isSelected ? '700' : '500' }}>{t.label}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Engine Status */}
          <div style={{ background: 'var(--slate-50, #f8fafc)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-main, #e2e8f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Cpu size={18} color="var(--primary)" />
              <strong style={{ fontSize: '15px', color: 'var(--text-main, #0f172a)' }}>Active AI Engine</strong>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--slate-700, #334155)' }}>
              {health?.ai_provider === 'gemini' && 'Google Gemini 1.5 Flash (Live API)'}
              {health?.ai_provider === 'openai' && 'OpenAI GPT-4o Mini (Live API)'}
              {health?.ai_provider === 'fallback_engine' && 'Intelligent Educational Synthesis Engine (Local / Zero-Failure Fallback)'}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--slate-500, #64748b)', marginTop: '6px' }}>
              The system supports live Google Gemini and OpenAI keys via <code>backend/.env</code>, and includes a deterministic domain synthesis engine for 100% offline uptime and instant evaluation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--slate-50, #f8fafc)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-main, #e2e8f0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-500, #64748b)', fontSize: '13px', marginBottom: '4px' }}>
                <Clock size={16} /> Target Lesson Duration
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main, #0f172a)' }}>
                {health?.target_lesson_duration || 45} Minutes
              </div>
            </div>

            <div style={{ background: 'var(--slate-50, #f8fafc)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-main, #e2e8f0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-500, #64748b)', fontSize: '13px', marginBottom: '4px' }}>
                <ShieldCheck size={16} /> Quality Control Layers
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                2 Independent Layers
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--slate-50, #f8fafc)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-main, #e2e8f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-500, #64748b)', fontSize: '13px', marginBottom: '6px' }}>
              <Database size={16} /> Local Persistence
            </div>
            <div style={{ fontSize: '13px', color: 'var(--slate-700, #334155)' }}>
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
