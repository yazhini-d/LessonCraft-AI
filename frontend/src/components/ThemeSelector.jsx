import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check, Contrast, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeObj = themes.find(t => t.id === theme) || themes[0];

  const getThemeIcon = (id) => {
    switch (id) {
      case 'bw-dark':
        return <Moon size={15} />;
      case 'bw-light':
        return <Sun size={15} />;
      default:
        return <Palette size={15} />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        className="btn btn-outline btn-sm theme-selector-btn"
        onClick={() => setOpen(!open)}
        title="Change theme (Default, Black & White Light, Black & White Dark)"
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Contrast size={14} />
        <span style={{ fontWeight: '600', fontSize: '13px' }}>
          {currentThemeObj.label}
        </span>
        <ChevronDown size={13} style={{ opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {open && (
        <div 
          className="theme-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '260px',
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-main, #e2e8f0)',
            borderRadius: '10px',
            boxShadow: 'var(--card-shadow-lg)',
            padding: '8px',
            zIndex: 100,
          }}
        >
          <div style={{ padding: '6px 10px 8px 10px', borderBottom: '1px solid var(--slate-200)', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--slate-500)' }}>
              Select Visual Theme
            </span>
          </div>

          {themes.map((t) => {
            const isSelected = t.id === theme;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={`theme-option-item ${isSelected ? 'selected' : ''}`}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'inherit',
                  transition: 'background 0.15s ease',
                  marginBottom: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '600' }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--slate-500)', lineHeight: '1.2' }}>
                      {t.description}
                    </div>
                  </div>
                </div>
                {isSelected && <Check size={14} color="var(--primary)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

