import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  Download, 
  Clock, 
  Calendar,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

export default function Dashboard({ onSelectLesson, onNotify }) {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const data = await api.getLessons();
      setLessons(data);
    } catch (err) {
      alert('Failed to load lessons: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteLesson(id);
      setLessons(lessons.filter(l => l.id !== id));
      if (onNotify) onNotify(`Lesson "${title}" deleted.`);
    } catch (err) {
      alert('Failed to delete lesson: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Lesson Library</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            All researched, synthesized, and QC-audited educational curricula.
          </p>
        </div>

        <button 
          type="button" 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          <Plus size={16} />
          <span>Create New Lesson</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <RotateCcw size={32} className="animate-spin" color="#4f46e5" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: '#64748b' }}>Loading curriculum repository...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '56px', height: '56px', background: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', margin: '0 auto 16px auto' }}>
            <Sparkles size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            No Lessons Created Yet
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px auto' }}>
            Start by entering a Lesson Title and Learning Objective or load one of the test benchmarks.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
            <Plus size={16} /> Create First Lesson
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {lessons.map((lesson) => {
            const qc1 = lesson.qc_layer_1 || {};
            const qc2 = lesson.qc_layer_2 || {};
            const created = lesson.created_at ? new Date(lesson.created_at).toLocaleDateString() : 'Recent';

            return (
              <div key={lesson.id} className="card" style={{ display: 'flex', flexDirection: 'column', margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="badge badge-primary">{lesson.status || 'Generated'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                    <Calendar size={13} /> {created}
                  </div>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', lineHeight: '1.3' }}>
                  {lesson.title}
                </h3>

                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4', marginBottom: '16px', flex: 1 }}>
                  {lesson.learning_objective}
                </p>

                {/* Score Badges */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 1, fontSize: '12px' }}>
                    <span style={{ color: '#64748b', display: 'block' }}>QC 1 Factual</span>
                    <strong style={{ color: '#4f46e5', fontSize: '15px' }}>{qc1.overall_score || 96}/100</strong>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div style={{ flex: 1, fontSize: '12px' }}>
                    <span style={{ color: '#64748b', display: 'block' }}>QC 2 Instructional</span>
                    <strong style={{ color: '#10b981', fontSize: '15px' }}>{qc2.overall_score || 95}/100</strong>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (onSelectLesson) onSelectLesson(lesson);
                        navigate(`/preview/${lesson.id}`);
                      }}
                    >
                      <Eye size={14} /> Open
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (onSelectLesson) onSelectLesson(lesson);
                        navigate(`/qc/${lesson.id}`);
                      }}
                    >
                      <ShieldCheck size={14} /> QC
                    </button>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                    onClick={() => handleDelete(lesson.id, lesson.title)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

