import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  RotateCcw, 
  FileCheck2, 
  GraduationCap, 
  Search, 
  Layers
} from 'lucide-react';
import api from '../services/api';

export default function CreateLesson({ onLessonCreated }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [targetDuration, setTargetDuration] = useState(45);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: idle, 1: researching, 2: synthesizing, 3: qc1, 4: qc2, 5: complete
  const [error, setError] = useState(null);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    api.getSampleInputs().then(data => setSamples(data)).catch(() => {});
  }, []);

  const handleSelectSample = (sample) => {
    setTitle(sample.title);
    setLearningObjective(sample.learning_objective);
    setTargetDuration(sample.target_duration || 45);
    setError(null);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a Lesson Title.');
      return;
    }
    if (!learningObjective.trim() || learningObjective.trim().length < 10) {
      setError('Please provide a descriptive Learning Objective (at least 10 characters).');
      return;
    }

    setError(null);
    setLoading(true);
    setCurrentStep(1);

    try {
      // Simulate stepped feedback for user visibility of pipeline stages
      const stepTimer1 = setTimeout(() => setCurrentStep(2), 700);
      const stepTimer2 = setTimeout(() => setCurrentStep(3), 1500);
      const stepTimer3 = setTimeout(() => setCurrentStep(4), 2200);

      const generated = await api.generateLesson({
        title: title.trim(),
        learning_objective: learningObjective.trim(),
        target_duration: parseInt(targetDuration) || 45,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setCurrentStep(5);

      onLessonCreated(generated);
      setTimeout(() => {
        navigate(`/preview/${generated.id}`);
      }, 600);

    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Generation failed. Please try again.');
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 36px auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eef2ff', color: '#4f46e5', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>
          <GraduationCap size={16} /> Kalvium AI Research Intern Workflow
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '12px' }}>
          AI-Powered 45-Minute Lesson Architect
        </h1>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>
          Synthesize structured educational lessons from multi-source research (Books, Web, YouTube) 
          and audit rigorously through two independent Quality Control layers.
        </p>
      </div>

      {/* Benchmark Presets */}
      <div className="card" style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>
            Quick-Load Sample Testing Benchmarks
          </span>
          <span className="badge badge-primary">Evaluation Ready</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {samples.map((sample) => (
            <div 
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              style={{
                background: '#ffffff',
                border: title === sample.title ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{sample.title}</strong>
                <span className="badge badge-neutral">{sample.target_duration}m</span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 10px 0', lineHeight: '1.4' }}>
                {sample.learning_objective}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>
                <span>Select & Pre-fill</span> <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="card">
        <form onSubmit={handleGenerate}>
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={18} color="#4f46e5" />
              <span>Lesson Parameters</span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#64748b" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Target Duration:</span>
              <select 
                className="form-control" 
                style={{ width: '110px', padding: '6px 10px', fontWeight: '600' }}
                value={targetDuration}
                onChange={e => setTargetDuration(parseInt(e.target.value))}
              >
                <option value={45}>45 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b', fontSize: '14px' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ color: '#991b1b', borderColor: '#fca5a5' }}
                onClick={() => handleGenerate()}
              >
                <RotateCcw size={14} /> Retry
              </button>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Lesson Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. HTTP Requests and Responses"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Learning Objective <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea 
              className="form-control" 
              rows={3}
              placeholder="e.g. Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories."
              value={learningObjective}
              onChange={e => setLearningObjective(e.target.value)}
              disabled={loading}
              required
            />
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              Specify the intended learning outcome using actionable Bloom's Taxonomy verbs (Explain, Distinguish, Implement, Analyze).
            </div>
          </div>

          {/* Pipeline Stage Tracker */}
          {loading && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', margin: '24px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
                Automated 4-Stage Generation & Quality Control Pipeline
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: currentStep >= 1 ? '#4f46e5' : '#94a3b8', fontWeight: currentStep === 1 ? '700' : '500' }}>
                  {currentStep > 1 ? <CheckCircle size={16} color="#10b981" /> : <Search size={16} />}
                  <span>1. Multi-Source Research</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: currentStep >= 2 ? '#4f46e5' : '#94a3b8', fontWeight: currentStep === 2 ? '700' : '500' }}>
                  {currentStep > 2 ? <CheckCircle size={16} color="#10b981" /> : <Layers size={16} />}
                  <span>2. 45-Min Synthesis</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: currentStep >= 3 ? '#4f46e5' : '#94a3b8', fontWeight: currentStep === 3 ? '700' : '500' }}>
                  {currentStep > 3 ? <CheckCircle size={16} color="#10b981" /> : <FileCheck2 size={16} />}
                  <span>3. QC Layer 1 (Factual)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: currentStep >= 4 ? '#4f46e5' : '#94a3b8', fontWeight: currentStep === 4 ? '700' : '500' }}>
                  {currentStep >= 5 ? <CheckCircle size={16} color="#10b981" /> : <GraduationCap size={16} />}
                  <span>4. QC Layer 2 (Instructional)</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ minWidth: '220px' }}
            >
              {loading ? (
                <>
                  <RotateCcw size={18} className="animate-spin" />
                  <span>Processing Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Lesson & Run Dual QC</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
