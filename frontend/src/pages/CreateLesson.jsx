import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  Eye,
  FileText
} from 'lucide-react';
import api from '../services/api';

export default function CreateLesson({ onLessonCreated }) {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [title, setTitle] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [targetDuration, setTargetDuration] = useState(45);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: idle, 1: researching, 2: synthesizing, 3: qc1, 4: qc2, 5: complete
  const [error, setError] = useState(null);
  const [samples, setSamples] = useState([]);
  const [existingLessons, setExistingLessons] = useState([]);

  useEffect(() => {
    api.getSampleInputs().then(data => setSamples(data)).catch(() => {});
    api.getLessons().then(data => setExistingLessons(data)).catch(() => {});
  }, []);

  // Pre-fill parameters and scroll smoothly down to the form
  const handleSelectSample = (sample) => {
    setTitle(sample.title);
    setLearningObjective(sample.learning_objective);
    setTargetDuration(sample.target_duration || 45);
    setError(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Find if a pre-generated lesson already exists for this benchmark
  const findMatchingLesson = (sampleTitle) => {
    return existingLessons.find(l => 
      l.title.toLowerCase().includes(sampleTitle.toLowerCase().slice(0, 12))
    );
  };

  // Direct open or generate immediately
  const handleOpenDirectly = async (sample, e) => {
    if (e) e.stopPropagation();
    const existing = findMatchingLesson(sample.title);
    if (existing) {
      if (onLessonCreated) onLessonCreated(existing);
      navigate(`/preview/${existing.id}`);
      return;
    }

    // If not yet generated, prefill and trigger pipeline
    setTitle(sample.title);
    setLearningObjective(sample.learning_objective);
    setTargetDuration(sample.target_duration || 45);
    await executeGeneration(sample.title, sample.learning_objective, sample.target_duration || 45);
  };

  const executeGeneration = async (genTitle, genObjective, genDuration) => {
    setError(null);
    setLoading(true);
    setCurrentStep(1);

    try {
      const stepTimer1 = setTimeout(() => setCurrentStep(2), 700);
      const stepTimer2 = setTimeout(() => setCurrentStep(3), 1500);
      const stepTimer3 = setTimeout(() => setCurrentStep(4), 2200);

      const generated = await api.generateLesson({
        title: genTitle.trim(),
        learning_objective: genObjective.trim(),
        target_duration: parseInt(genDuration) || 45,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setCurrentStep(5);

      if (onLessonCreated) onLessonCreated(generated);
      setTimeout(() => {
        navigate(`/preview/${generated.id}`);
      }, 500);

    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Generation failed. Please try again.');
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
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
    await executeGeneration(title, learningObjective, targetDuration);
  };

  return (
    <div>
      {/* Hero Header without any unwanted branding */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 36px auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-main, #0f172a)', letterSpacing: '-0.5px', marginBottom: '12px' }}>
          AI-Powered 45-Minute Lesson Architect
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--slate-600, #475569)', lineHeight: '1.6' }}>
          Synthesize structured educational lessons from multi-source research (Books, Web, YouTube) 
          and audit rigorously through two independent Quality Control layers.
        </p>
      </div>

      {/* Benchmark Presets Card */}
      <div className="card" style={{ background: 'var(--slate-50, #f8fafc)', borderColor: 'var(--border-main, #e2e8f0)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--slate-500, #64748b)' }}>
            Quick-Load Sample Testing Benchmarks
          </span>
          <span className="badge badge-primary">Evaluation Ready</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {samples.map((sample) => {
            const existing = findMatchingLesson(sample.title);
            const isSelected = title === sample.title;

            return (
              <div 
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                style={{
                  background: 'var(--bg-surface, #ffffff)',
                  border: isSelected ? '2px solid var(--primary, #4f46e5)' : '1px solid var(--border-main, #e2e8f0)',
                  borderRadius: '10px',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '15px', color: 'var(--text-main, #0f172a)' }}>{sample.title}</strong>
                    <span className="badge badge-neutral">{sample.target_duration}m</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--slate-500, #64748b)', margin: '4px 0 14px 0', lineHeight: '1.4' }}>
                    {sample.learning_objective}
                  </p>
                </div>

                {/* Two Action Buttons: Pre-fill Form OR Open Lesson Directly */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-main, #e2e8f0)' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSample(sample);
                    }}
                    title="Pre-fill title and objective into form and scroll down"
                  >
                    <FileText size={13} />
                    <span>Pre-fill Form</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={(e) => handleOpenDirectly(sample, e)}
                    disabled={loading}
                    title={existing ? "Open this ready lesson in presentation preview" : "Synthesize and open lesson"}
                  >
                    <Eye size={13} />
                    <span>{existing ? 'Open Lesson' : 'Generate & Open'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="card" ref={formRef}>
        <form onSubmit={handleGenerate}>
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={18} color="var(--primary, #4f46e5)" />
              <span>Lesson Parameters</span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--slate-500, #64748b)" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--slate-500, #64748b)' }}>Target Duration:</span>
              <select 
                className="form-control" 
                style={{ width: '120px', padding: '6px 10px', fontWeight: '600' }}
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
            <div style={{ fontSize: '12px', color: 'var(--slate-500, #64748b)', marginTop: '6px' }}>
              Specify the intended learning outcome using actionable Bloom's Taxonomy verbs (Explain, Distinguish, Implement, Analyze).
            </div>
          </div>

          {/* Pipeline Stage Tracker */}
          {loading && (
            <div style={{ background: 'var(--slate-50, #f8fafc)', border: '1px solid var(--border-main, #e2e8f0)', borderRadius: '10px', padding: '20px', margin: '24px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main, #0f172a)', marginBottom: '14px' }}>
                Automated 4-Stage Generation & Quality Control Pipeline
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: currentStep >= 1 ? 'var(--primary, #4f46e5)' : 'var(--slate-400)', fontWeight: currentStep === 1 ? '700' : '500' }}>
                  {currentStep > 1 ? <CheckCircle size={16} color="var(--primary)" /> : <Search size={16} />}
                  <span>1. Multi-Source Research</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: currentStep >= 2 ? 'var(--primary, #4f46e5)' : 'var(--slate-400)', fontWeight: currentStep === 2 ? '700' : '500' }}>
                  {currentStep > 2 ? <CheckCircle size={16} color="var(--primary)" /> : <Layers size={16} />}
                  <span>2. 45-Min Synthesis</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: currentStep >= 3 ? 'var(--primary, #4f46e5)' : 'var(--slate-400)', fontWeight: currentStep === 3 ? '700' : '500' }}>
                  {currentStep > 3 ? <CheckCircle size={16} color="var(--primary)" /> : <FileCheck2 size={16} />}
                  <span>3. QC Layer 1 (Factual)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: currentStep >= 4 ? 'var(--primary, #4f46e5)' : 'var(--slate-400)', fontWeight: currentStep === 4 ? '700' : '500' }}>
                  {currentStep >= 5 ? <CheckCircle size={16} color="var(--primary)" /> : <GraduationCap size={16} />}
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
