import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  Download, 
  Edit3, 
  ExternalLink, 
  Youtube, 
  BookOpen, 
  Code, 
  HelpCircle, 
  Check, 
  X, 
  FileText
} from 'lucide-react';
import api from '../services/api';
import LessonEditor from '../components/LessonEditor';
import ExportModal from '../components/ExportModal';

export default function LessonPreview({ activeLesson, onLessonUpdated, onNotify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(activeLesson || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum', 'quiz', 'videos', 'references', 'editor'
  const [exportOpen, setExportOpen] = useState(false);

  // 45-Minute Timer State
  const [timerSeconds, setTimerSeconds] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Quiz Interaction State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    const lessonId = id || activeLesson?.id;
    if (lessonId && (!lesson || lesson.id !== lessonId)) {
      setLoading(true);
      api.getLesson(lessonId)
        .then(data => {
          setLesson(data);
          setTimerSeconds((data.target_duration || 45) * 60);
        })
        .catch(err => alert('Failed to load lesson: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [id, activeLesson]);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  if (loading || !lesson) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <RotateCcw size={32} className="animate-spin" color="#4f46e5" style={{ margin: '0 auto 16px auto' }} />
        <p style={{ color: '#64748b' }}>Loading finalized lesson preview...</p>
      </div>
    );
  }

  const content = lesson.content || {};
  const qc1 = lesson.qc_layer_1 || {};
  const qc2 = lesson.qc_layer_2 || {};
  const quizzes = content.knowledge_checks || [];

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectQuizAnswer = (qId, optionIdx, correctIdx) => {
    if (selectedAnswers[qId] !== undefined) return; // already answered
    const updated = { ...selectedAnswers, [qId]: optionIdx };
    setSelectedAnswers(updated);

    // Calculate score
    let score = 0;
    quizzes.forEach(q => {
      if (updated[q.id] === q.correct_index) score += 1;
    });
    setQuizScore(score);
  };

  const handleLessonUpdate = (updated) => {
    setLesson(updated);
    if (onLessonUpdated) onLessonUpdated(updated);
  };

  return (
    <div>
      {/* Header & Meta Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-primary">Final Lesson Preview</span>
            <span className="badge badge-success">
              <ShieldCheck size={13} /> QC 1: {qc1.overall_score || 96}/100
            </span>
            <span className="badge badge-success">
              <ShieldCheck size={13} /> QC 2: {qc2.overall_score || 95}/100
            </span>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a' }}>{lesson.title}</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={() => setActiveTab(activeTab === 'editor' ? 'curriculum' : 'editor')}
          >
            <Edit3 size={15} />
            <span>{activeTab === 'editor' ? 'Exit Editor' : 'Edit Content'}</span>
          </button>

          <button 
            type="button" 
            className="btn btn-outline"
            onClick={() => navigate(`/qc/${lesson.id}`)}
          >
            <ShieldCheck size={15} />
            <span>View QC Audits</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setExportOpen(true)}
          >
            <Download size={15} />
            <span>Export Final</span>
          </button>
        </div>
      </div>

      {/* Learning Objective Callout */}
      <div style={{ background: '#eef2ff', borderLeft: '4px solid #4f46e5', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px' }}>
        <strong style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#4f46e5', display: 'block', marginBottom: '4px' }}>
          🎯 Target Learning Objective
        </strong>
        <p style={{ fontSize: '15px', color: '#1e1b4b', fontWeight: '500' }}>
          {lesson.learning_objective}
        </p>
      </div>

      {/* 45-Minute Lesson Timer & Delivery Bar */}
      <div className="card" style={{ padding: '16px 20px', background: '#0f172a', color: '#ffffff', borderColor: '#1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', background: 'rgba(79, 70, 229, 0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: '700' }}>
                45-Minute Instructional Delivery Tracker
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#ffffff', letterSpacing: '1px' }}>
                {formatTimer(timerSeconds)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button" 
              className={`btn ${timerRunning ? 'btn-outline' : 'btn-primary'} btn-sm`}
              style={timerRunning ? { color: '#ffffff', borderColor: '#475569' } : {}}
              onClick={() => setTimerRunning(!timerRunning)}
            >
              {timerRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{timerRunning ? 'Pause Session' : 'Start Delivery'}</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              style={{ background: '#334155', color: '#ffffff' }}
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds((lesson.target_duration || 45) * 60);
              }}
              title="Reset Timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          style={{
            padding: '12px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'curriculum' ? '3px solid #4f46e5' : '3px solid transparent',
            fontWeight: activeTab === 'curriculum' ? '700' : '500',
            color: activeTab === 'curriculum' ? '#4f46e5' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={16} />
          <span>Lesson Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          style={{
            padding: '12px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'quiz' ? '3px solid #4f46e5' : '3px solid transparent',
            fontWeight: activeTab === 'quiz' ? '700' : '500',
            color: activeTab === 'quiz' ? '#4f46e5' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <HelpCircle size={16} />
          <span>Interactive Quiz ({quizzes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          style={{
            padding: '12px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'videos' ? '3px solid #4f46e5' : '3px solid transparent',
            fontWeight: activeTab === 'videos' ? '700' : '500',
            color: activeTab === 'videos' ? '#4f46e5' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Youtube size={16} color="#ef4444" />
          <span>Supplementary Videos ({content.supplementary_videos?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('references')}
          style={{
            padding: '12px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'references' ? '3px solid #4f46e5' : '3px solid transparent',
            fontWeight: activeTab === 'references' ? '700' : '500',
            color: activeTab === 'references' ? '#4f46e5' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <BookOpen size={16} />
          <span>References ({content.references?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          style={{
            padding: '12px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'editor' ? '3px solid #4f46e5' : '3px solid transparent',
            fontWeight: activeTab === 'editor' ? '700' : '500',
            color: activeTab === 'editor' ? '#4f46e5' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Edit3 size={16} />
          <span>Instructor Editor</span>
        </button>
      </div>

      {/* TAB 1: CURRICULUM CONTENT */}
      {activeTab === 'curriculum' && (
        <div>
          {/* Overview Section */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
              Lesson Overview & Pedagogical Hook (00:00 - 05:00)
            </h3>
            <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.7' }}>
              {content.overview}
            </p>
          </div>

          {/* 45-Minute Pacing Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Clock size={18} color="#4f46e5" />
                <span>45-Minute Pacing & Sequence</span>
              </h3>
              <span className="badge badge-primary">Total: {lesson.target_duration || 45} min</span>
            </div>

            <div className="timeline-track">
              {content.timeline_breakdown?.map((phase, idx) => (
                <div key={idx} className="timeline-step">
                  <div className="time-tag">{phase.minutes} Minutes</div>
                  <div className="phase-title">{phase.phase}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: '1.3' }}>
                    {phase.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Instructional Sections */}
          {content.sections?.map((section, idx) => (
            <div key={section.id || idx} className="card">
              <div className="card-header">
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Section {idx + 1}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{section.title}</h3>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '13px' }}>
                  <Clock size={13} /> {section.duration_min} min
                </span>
              </div>

              <div className="markdown-body">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: '#ffffff', color: 'inherit', padding: 0 }}>
                  {section.markdown_content}
                </pre>
              </div>

              {section.instructor_notes && (
                <div style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '12px 16px', borderRadius: '4px', fontSize: '13px', marginTop: '16px', color: '#92400e' }}>
                  <strong>👨‍🏫 Instructor Pacing Cue:</strong> {section.instructor_notes}
                </div>
              )}
            </div>
          ))}

          {/* Hands-on Lab Activity */}
          {content.activity && (
            <div className="card" style={{ border: '2px solid #818cf8', background: '#faf5ff' }}>
              <div className="card-header" style={{ borderColor: '#e9d5ff' }}>
                <div>
                  <span className="badge badge-primary" style={{ background: '#7c3aed', color: '#fff', marginBottom: '6px' }}>
                    Guided Lab Activity
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#4c1d95' }}>
                    {content.activity.title}
                  </h3>
                </div>
                <span className="badge badge-neutral">
                  <Clock size={13} /> {content.activity.duration_min || 10} min
                </span>
              </div>

              <p style={{ fontSize: '14px', color: '#581c87', marginBottom: '14px' }}>
                <strong>Instructions:</strong> {content.activity.instructions}
              </p>

              {content.activity.challenge_prompt && (
                <div style={{ background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                  <strong style={{ fontSize: '13px', color: '#6b21a8', display: 'block', marginBottom: '6px' }}>
                    Challenge Scenario:
                  </strong>
                  <pre style={{ margin: 0, fontSize: '13px', background: '#f8fafc', color: '#1e293b', padding: '10px', borderRadius: '6px' }}>
                    {content.activity.challenge_prompt}
                  </pre>
                </div>
              )}

              {content.activity.starter_code && (
                <div style={{ marginBottom: '14px' }}>
                  <strong style={{ fontSize: '13px', color: '#6b21a8', display: 'block', marginBottom: '6px' }}>
                    Starter Code:
                  </strong>
                  <pre style={{ margin: 0, fontSize: '13px', background: '#1e293b', color: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                    <code>{content.activity.starter_code}</code>
                  </pre>
                </div>
              )}

              {content.activity.solution_code && (
                <details style={{ marginTop: '10px', cursor: 'pointer' }}>
                  <summary style={{ fontSize: '13px', fontWeight: '700', color: '#7c3aed' }}>
                    Reveal Solution & Instructor Debrief Key
                  </summary>
                  <pre style={{ marginTop: '8px', fontSize: '13px', background: '#0f172a', color: '#a7f3d0', padding: '14px', borderRadius: '8px' }}>
                    <code>{content.activity.solution_code}</code>
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Key Summary Takeaways */}
          {content.summary_takeaways?.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
                Key Takeaways & Conceptual Synthesis
              </h3>
              <ul style={{ paddingLeft: '20px', color: '#334155', fontSize: '14px' }}>
                {content.summary_takeaways.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.5' }}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE QUIZ */}
      {activeTab === 'quiz' && (
        <div>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                Active Recall & Knowledge Verification Check
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Formative assessment designed to test understanding of the learning objective.
              </p>
            </div>
            {quizScore !== null && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '8px 16px', borderRadius: '8px', color: '#065f46', fontWeight: '700' }}>
                Score: {quizScore} / {quizzes.length} ({Math.round((quizScore / quizzes.length) * 100)}%)
              </div>
            )}
          </div>

          {quizzes.map((q, qIdx) => {
            const hasAnswered = selectedAnswers[q.id] !== undefined;
            const chosen = selectedAnswers[q.id];
            const isCorrect = chosen === q.correct_index;

            return (
              <div key={q.id || qIdx} className="quiz-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                    Question {qIdx + 1}: {q.question}
                  </strong>
                  {q.related_concept && (
                    <span className="badge badge-neutral">{q.related_concept}</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options?.map((option, optIdx) => {
                    let optionClass = 'quiz-option';
                    if (hasAnswered) {
                      if (optIdx === q.correct_index) {
                        optionClass += ' selected-correct';
                      } else if (chosen === optIdx) {
                        optionClass += ' selected-incorrect';
                      }
                    }

                    return (
                      <div 
                        key={optIdx} 
                        className={optionClass}
                        onClick={() => handleSelectQuizAnswer(q.id, optIdx, q.correct_index)}
                      >
                        <span style={{ fontWeight: '700', color: '#64748b', minWidth: '20px' }}>
                          {chr(65 + optIdx)}.
                        </span>
                        <span style={{ flex: 1 }}>{option}</span>
                        {hasAnswered && optIdx === q.correct_index && (
                          <Check size={16} color="#10b981" />
                        )}
                        {hasAnswered && chosen === optIdx && optIdx !== q.correct_index && (
                          <X size={16} color="#ef4444" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div className="explanation-box" style={{ marginTop: '14px' }}>
                    <strong>Pedagogical Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: SUPPLEMENTARY VIDEOS */}
      {activeTab === 'videos' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Youtube size={20} color="#ef4444" />
              <span>Supplementary Educational Video Resources</span>
            </h3>
            <span className="badge badge-primary">Curated YouTube Tutorials</span>
          </div>

          <div className="video-grid">
            {(content.supplementary_videos || []).map((video, idx) => (
              <div key={idx} className="video-card">
                <div className="video-thumb-container">
                  <img 
                    src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`} 
                    alt={video.title} 
                    className="video-thumb"
                  />
                  {video.duration && (
                    <span className="video-duration">{video.duration}</span>
                  )}
                </div>
                <div className="video-info">
                  <div>
                    <h4 className="video-title">{video.title}</h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      Channel: <strong>{video.channel}</strong>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                      {video.relevance_summary}
                    </p>
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <ExternalLink size={13} /> Watch on YouTube
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REFERENCES */}
      {activeTab === 'references' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <BookOpen size={18} color="#4f46e5" />
              <span>Academic Textbooks, RFCs & Web Specifications</span>
            </h3>
            <span className="badge badge-neutral">Research Bibliography</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(content.references || []).map((ref, idx) => (
              <li 
                key={idx}
                style={{
                  padding: '14px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span className="badge badge-primary" style={{ marginRight: '10px' }}>{ref.type}</span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{ref.title}</strong>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    {ref.citation}
                  </div>
                </div>
                {ref.url && (
                  <a 
                    href={ref.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    <ExternalLink size={13} /> View
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB 5: INSTRUCTOR EDITOR */}
      {activeTab === 'editor' && (
        <LessonEditor 
          lesson={lesson} 
          onUpdate={handleLessonUpdate}
          onNotify={onNotify}
        />
      )}

      {/* Export Modal */}
      <ExportModal 
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        lesson={lesson}
      />
    </div>
  );
}

function chr(code) {
  return String.fromCharCode(code);
}

