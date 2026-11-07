import React, { useState } from 'react';
import { Save, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

export default function LessonEditor({ lesson, onUpdate, onNotify }) {
  const [formData, setFormData] = useState({
    title: lesson.title || '',
    learning_objective: lesson.learning_objective || '',
    overview: lesson.content?.overview || '',
    sections: lesson.content?.sections ? JSON.parse(JSON.stringify(lesson.content.sections)) : [],
  });
  const [saving, setSaving] = useState(false);

  const handleSectionChange = (index, field, value) => {
    const updated = [...formData.sections];
    updated[index][field] = value;
    setFormData({ ...formData, sections: updated });
  };

  const handleAddSection = () => {
    const newSection = {
      id: `sec-${Date.now()}`,
      title: 'New Instructional Section',
      duration_min: 5,
      markdown_content: 'Write explanation, code examples, and concepts here...',
      instructor_notes: 'Cues for pacing and student engagement.',
    };
    setFormData({ ...formData, sections: [...formData.sections, newSection] });
  };

  const handleRemoveSection = (index) => {
    if (formData.sections.length <= 1) {
      alert('Lesson must have at least one instructional section.');
      return;
    }
    const updated = formData.sections.filter((_, idx) => idx !== index);
    setFormData({ ...formData, sections: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        learning_objective: formData.learning_objective,
        content: {
          ...lesson.content,
          overview: formData.overview,
          sections: formData.sections,
        },
      };
      const updated = await api.updateLesson(lesson.id, payload);
      onUpdate(updated);
      onNotify('Lesson edits saved successfully!');
    } catch (err) {
      alert('Failed to save edits: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>Instructor Content Review & Editor</span>
          <span className="badge badge-neutral" style={{ fontWeight: 'normal' }}>
            Interactive Markdown
          </span>
        </h3>
        <button 
          type="button" 
          className="btn btn-primary btn-sm" 
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={15} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Lesson Title</label>
        <input 
          type="text" 
          className="form-control" 
          value={formData.title} 
          onChange={e => setFormData({ ...formData, title: e.target.value })} 
        />
      </div>

      <div className="form-group">
        <label className="form-label">Learning Objective</label>
        <textarea 
          className="form-control" 
          rows={2}
          value={formData.learning_objective} 
          onChange={e => setFormData({ ...formData, learning_objective: e.target.value })} 
        />
      </div>

      <div className="form-group">
        <label className="form-label">Lesson Overview & Pedagogical Hook</label>
        <textarea 
          className="form-control" 
          rows={3}
          value={formData.overview} 
          onChange={e => setFormData({ ...formData, overview: e.target.value })} 
        />
      </div>

      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '24px 0 14px 0' }}>
        Curriculum Sections ({formData.sections.length})
      </h4>

      {formData.sections.map((section, idx) => (
        <div 
          key={section.id || idx} 
          style={{ 
            border: '1px solid #e2e8f0', 
            borderRadius: '10px', 
            padding: '18px', 
            marginBottom: '18px', 
            background: '#fafafa' 
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            <span className="badge badge-primary">Section {idx + 1}</span>
            <input 
              type="text" 
              className="form-control" 
              style={{ fontWeight: '600' }}
              value={section.title} 
              onChange={e => handleSectionChange(idx, 'title', e.target.value)} 
              placeholder="Section Title"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <Clock size={15} color="#64748b" />
              <input 
                type="number" 
                className="form-control" 
                style={{ width: '70px', padding: '6px 8px', textAlign: 'center' }}
                value={section.duration_min || 5} 
                onChange={e => handleSectionChange(idx, 'duration_min', parseInt(e.target.value) || 5)} 
                min={1} 
                max={45}
              />
              <span style={{ fontSize: '13px', color: '#64748b' }}>min</span>
            </div>
            <button 
              type="button" 
              className="btn btn-outline btn-sm" 
              style={{ color: '#ef4444', borderColor: '#fca5a5' }}
              onClick={() => handleRemoveSection(idx)}
              title="Delete section"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ fontSize: '12px' }}>Content (Markdown & Code)</label>
            <textarea 
              className="form-control" 
              style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
              rows={8}
              value={section.markdown_content} 
              onChange={e => handleSectionChange(idx, 'markdown_content', e.target.value)} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" style={{ fontSize: '12px' }}>Instructor Pacing & Teaching Cues</label>
            <input 
              type="text" 
              className="form-control" 
              style={{ fontSize: '13px', background: '#fffbeb' }}
              value={section.instructor_notes || ''} 
              onChange={e => handleSectionChange(idx, 'instructor_notes', e.target.value)} 
              placeholder="Pedagogical cue for instructor..."
            />
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleAddSection}>
          <Plus size={15} /> Add Section
        </button>

        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

