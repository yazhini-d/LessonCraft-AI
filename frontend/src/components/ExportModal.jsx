import React, { useState } from 'react';
import { X, Download, FileText, Globe, Code, Check } from 'lucide-react';
import api from '../services/api';

export default function ExportModal({ isOpen, onClose, lesson }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lesson) return null;

  const handleDownload = (format) => {
    api.exportLessonFile(lesson.id, format);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(lesson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Export Final Lesson Package</h2>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Includes 45-minute lesson, verified references, and both QC audit reports</div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', margin: '20px 0' }}>
          {/* Markdown Export */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', background: '#eef2ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                <FileText size={20} />
              </div>
            </div>
            <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>Markdown (.md)</strong>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 14px 0' }}>
              Standard GitHub Markdown formatted for LMS, Notion, or GitHub repos.
            </p>
            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              style={{ width: '100%' }}
              onClick={() => handleDownload('md')}
            >
              <Download size={14} /> Download .md
            </button>
          </div>

          {/* HTML / Printable PDF */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', background: '#ecfdf5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Globe size={20} />
              </div>
            </div>
            <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>HTML / Print PDF</strong>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 14px 0' }}>
              Self-contained styled document ready for web viewing or Save-to-PDF.
            </p>
            <button 
              type="button" 
              className="btn btn-success btn-sm" 
              style={{ width: '100%' }}
              onClick={() => handleDownload('html')}
            >
              <Download size={14} /> Open Printable HTML
            </button>
          </div>

          {/* Full Structured JSON */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', background: '#f0f9ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                <Code size={20} />
              </div>
            </div>
            <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>Raw JSON Data</strong>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 14px 0' }}>
              Full payload including research, timeline, QC1, and QC2 raw objects.
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ flex: 1 }}
                onClick={() => handleDownload('json')}
              >
                <Download size={14} /> File
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ flex: 1 }}
                onClick={handleCopyJson}
              >
                {copied ? <Check size={14} color="#10b981" /> : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
