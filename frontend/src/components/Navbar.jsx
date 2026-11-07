import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Library, 
  Settings, 
  Layers
} from 'lucide-react';

export default function Navbar({ activeLesson, onOpenSettings, onSelectSample }) {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <Layers size={22} />
          </div>
          <div className="brand-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1>LessonCraft AI</h1>
              <span className="brand-badge">Kalvium</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>45-Min Educational Synthesis & Dual QC</div>
          </div>
        </Link>

        <nav className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            <span>Create Lesson</span>
          </Link>

          <Link 
            to="/dashboard" 
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <Library size={16} />
            <span>Library</span>
          </Link>

          {activeLesson && (
            <>
              <Link 
                to={`/preview/${activeLesson.id}`} 
                className={`nav-link ${location.pathname.startsWith('/preview') ? 'active' : ''}`}
              >
                <Eye size={16} />
                <span>Presentation Preview</span>
              </Link>

              <Link 
                to={`/qc/${activeLesson.id}`} 
                className={`nav-link ${location.pathname.startsWith('/qc') ? 'active' : ''}`}
              >
                <ShieldCheck size={16} />
                <span>Dual QC Audits</span>
              </Link>
            </>
          )}
        </nav>

        <div className="nav-actions">
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={onOpenSettings}
            title="System Architecture & AI Providers"
          >
            <Settings size={15} />
            <span>System Status</span>
          </button>
        </div>
      </div>
    </header>
  );
}
