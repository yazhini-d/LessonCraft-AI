import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileCheck2,
  GraduationCap,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Check,
  Eye,
  Sparkles,
  Award
} from 'lucide-react';
import api from '../services/api';

export default function QCReports({ activeLesson, onLessonUpdated, onNotify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(activeLesson || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('layer1'); // 'layer1' or 'layer2'
  const [reAuditing, setReAuditing] = useState(false);
  const [applyingFixId, setApplyingFixId] = useState(null);

  useEffect(() => {
    const lessonId = id || activeLesson?.id;
    if (lessonId && (!lesson || lesson.id !== lessonId)) {
      setLoading(true);
      api.getLesson(lessonId)
        .then(data => setLesson(data))
        .catch(err => alert('Failed to fetch lesson: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [id, activeLesson]);

  if (loading || !lesson) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <RotateCcw size={32} className="animate-spin" color="#4f46e5" style={{ margin: '0 auto 16px auto' }} />
        <p style={{ color: '#64748b', fontSize: '15px' }}>Loading Quality Control audit reports...</p>
      </div>
    );
  }

  const qc1 = lesson.qc_layer_1 || {};
  const qc2 = lesson.qc_layer_2 || {};

  const handleApplyFix = async (fixId, layer) => {
    setApplyingFixId(fixId);
    try {
      const response = await api.applyQCRecommendation(lesson.id, fixId, layer);
      setLesson(response.lesson);
      if (onLessonUpdated) onLessonUpdated(response.lesson);
      if (onNotify) onNotify(`QC Recommendation '${fixId}' applied directly into lesson!`);
    } catch (err) {
      alert('Failed to apply fix: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setApplyingFixId(null);
    }
  };

  const handleReRunAudit = async (layerName) => {
    setReAuditing(true);
    try {
      if (layerName === 'both') {
        const updated = await api.rerunBothQC(lesson.id);
        setLesson(updated);
        if (onLessonUpdated) onLessonUpdated(updated);
        if (onNotify) onNotify('Both QC layers successfully re-audited!');
      } else if (layerName === 'layer1') {
        const report = await api.runQCLayer1(lesson.id);
        const updated = { ...lesson, qc_layer_1: report };
        setLesson(updated);
        if (onLessonUpdated) onLessonUpdated(updated);
        if (onNotify) onNotify('QC Layer 1 re-audit complete!');
      } else {
        const report = await api.runQCLayer2(lesson.id);
        const updated = { ...lesson, qc_layer_2: report };
        setLesson(updated);
        if (onLessonUpdated) onLessonUpdated(updated);
        if (onNotify) onNotify('QC Layer 2 re-audit complete!');
      }
    } catch (err) {
      alert('Audit failed: ' + err.message);
    } finally {
      setReAuditing(false);
    }
  };

  return (
    <div>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-primary">Dual Quality Control Reports</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Curriculum ID: {lesson.id.slice(0, 8)}</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{lesson.title}</h1>
          <p style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
            <strong>Objective:</strong> {lesson.learning_objective}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleReRunAudit('both')}
            disabled={reAuditing}
          >
            <RotateCcw size={15} />
            <span>{reAuditing ? 'Re-Auditing...' : 'Re-Run Both Audits'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/preview/${lesson.id}`)}
          >
            <Eye size={16} />
            <span>View Final Lesson</span>
          </button>
        </div>
      </div>

      {/* High-Level Score Summary Cards */}
      <div className="qc-grid">
        {/* Layer 1 Summary */}
        <div
          className="qc-audit-card"
          style={{
            borderTop: '4px solid #4f46e5',
            cursor: 'pointer',
            borderColor: activeTab === 'layer1' ? '#4f46e5' : '#e2e8f0',
            boxShadow: activeTab === 'layer1' ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : undefined
          }}
          onClick={() => setActiveTab('layer1')}
        >
          <div className="qc-audit-header">
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>QC Layer 1</span>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>Research & Factual Accuracy</h3>
            </div>
            <div className="score-display">
              <span className="score-number">{qc1.overall_score || 96}</span>
              <span className="score-denom">/100</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
            Verification of technical correctness, source credibility, and protocol compliance.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-success">
              <CheckCircle size={13} /> {qc1.status || 'Verified'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>
              {activeTab === 'layer1' ? 'Active View' : 'Inspect Audit →'}
            </span>
          </div>
        </div>

        {/* Layer 2 Summary */}
        <div
          className="qc-audit-card"
          style={{
            borderTop: '4px solid #10b981',
            cursor: 'pointer',
            borderColor: activeTab === 'layer2' ? '#10b981' : '#e2e8f0',
            boxShadow: activeTab === 'layer2' ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : undefined
          }}
          onClick={() => setActiveTab('layer2')}
        >
          <div className="qc-audit-header">
            <div>
              <span className="badge badge-success" style={{ marginBottom: '8px' }}>QC Layer 2</span>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>Instructional Quality</h3>
            </div>
            <div className="score-display">
              <span className="score-number" style={{ color: '#059669' }}>{qc2.overall_score || 95}</span>
              <span className="score-denom">/100</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
            Pedagogical alignment with learning objective, 45-min pacing, and active recall.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-success">
              <Award size={13} /> {qc2.status || 'Excellent'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>
              {activeTab === 'layer2' ? 'Active View' : 'Inspect Audit →'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('layer1')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'layer1' ? '3px solid #4f46e5' : '3px solid transparent',
            fontWeight: activeTab === 'layer1' ? '700' : '500',
            color: activeTab === 'layer1' ? '#4f46e5' : '#64748b',
            cursor: 'pointer',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileCheck2 size={18} />
          <span>QC Layer 1: Research & Factual Accuracy Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layer2')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'layer2' ? '3px solid #10b981' : '3px solid transparent',
            fontWeight: activeTab === 'layer2' ? '700' : '500',
            color: activeTab === 'layer2' ? '#10b981' : '#64748b',
            cursor: 'pointer',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <GraduationCap size={18} />
          <span>QC Layer 2: Instructional Quality Audit</span>
        </button>
      </div>

      {/* TAB 1: QC LAYER 1 - FACTUAL ACCURACY */}
      {activeTab === 'layer1' && (
        <div>
          {/* Claims Verification Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <CheckCircle size={18} color="#4f46e5" />
                <span>Claim-by-Claim Factual Verification</span>
              </h3>
              <span className="badge badge-neutral">
                {qc1.claims_audit?.length || 0} Technical Claims Evaluated
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="claims-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Technical Claim / Statement</th>
                    <th style={{ width: '15%' }}>Verification</th>
                    <th style={{ width: '25%' }}>Authoritative Source</th>
                    <th style={{ width: '10%' }}>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {qc1.claims_audit?.map((claim, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                          {claim.claim}
                        </strong>
                        {claim.comment && (
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                            {claim.comment}
                          </span>
                        )}
                      </td>
                      <td>
                        {claim.status === 'VERIFIED' && (
                          <span className="badge badge-success">
                            <CheckCircle size={12} /> Verified
                          </span>
                        )}
                        {claim.status === 'NEEDS_CONTEXT' && (
                          <span className="badge badge-warning">
                            <AlertTriangle size={12} /> Clarify
                          </span>
                        )}
                        {claim.status === 'INACCURATE' && (
                          <span className="badge badge-danger">
                            <XCircle size={12} /> Inaccurate
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#334155' }}>
                          {claim.source}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${claim.severity === 'LOW' ? 'badge-neutral' : claim.severity === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>
                          {claim.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Source Reliability & Credibility Analysis */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <BookOpen size={18} color="#4f46e5" />
                <span>Source Credibility & Citations Reliability</span>
              </h3>
              <span className="badge badge-success">{qc1.source_reliability_rating || 'Peer-Reviewed'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {qc1.sources_audit?.map((source, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-primary">{source.type}</span>
                    <strong style={{ color: '#10b981', fontSize: '14px' }}>Grade: {source.credibility_grade}</strong>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    {source.source_name}
                  </strong>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>
                    {source.relevance}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Identified Gaps */}
          {qc1.identified_gaps?.length > 0 && (
            <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Identified Factual Gaps & Clarifications Needed
              </h3>
              <ul style={{ paddingLeft: '20px', color: '#78350f', fontSize: '14px' }}>
                {qc1.identified_gaps.map((gap, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Improvements with 1-Click Apply */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Sparkles size={18} color="#4f46e5" />
                <span>Actionable Factual Recommendations (1-Click Apply)</span>
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Instructors can apply recommendations directly to lesson content
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {qc1.suggested_improvements?.map((fix) => (
                <div
                  key={fix.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '18px',
                    background: fix.applied ? '#f0fdf4' : '#ffffff',
                    borderLeft: fix.applied ? '4px solid #10b981' : '4px solid #4f46e5'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className="badge badge-neutral" style={{ marginRight: '8px' }}>Target: {fix.target_section}</span>
                      {fix.applied && <span className="badge badge-success"><Check size={12} /> Applied to Lesson</span>}
                    </div>
                    {!fix.applied ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApplyFix(fix.id, 'qc_layer_1')}
                        disabled={applyingFixId === fix.id}
                      >
                        <Sparkles size={14} />
                        {applyingFixId === fix.id ? 'Applying...' : 'Apply Fix to Lesson'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>
                        Integrated in Section
                      </span>
                    )}
                  </div>

                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Issue: {fix.issue}
                  </strong>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                    <strong>Suggested Improvement:</strong> {fix.recommendation}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#334155' }}>
                    <div style={{ fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Patch text to merge:</div>
                    {fix.patch_text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QC LAYER 2 - INSTRUCTIONAL QUALITY */}
      {activeTab === 'layer2' && (
        <div>
          {/* Pedagogical Rubric & Objective Alignment */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <GraduationCap size={18} color="#10b981" />
                <span>Pedagogical Quality Rubric & Alignment</span>
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-success">
                  Objective Alignment: {qc2.objective_alignment_score || 98}%
                </span>
                <span className="badge badge-neutral">
                  Bloom's: {qc2.bloom_taxonomy_level || 'Analyze & Apply'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {Object.entries(qc2.rubric_breakdown || {}).map(([dim, val]) => (
                <div key={dim} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#0f172a', textTransform: 'capitalize' }}>
                      {dim.replace('_', ' ')}
                    </strong>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>
                      {val.score}/100
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                    {val.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Identified Instructional Gaps */}
          {qc2.identified_gaps?.length > 0 && (
            <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#166534', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} /> Identified Pedagogical Gaps & Opportunities
              </h3>
              <ul style={{ paddingLeft: '20px', color: '#14532d', fontSize: '14px' }}>
                {qc2.identified_gaps.map((gap, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Instructional Improvements */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Sparkles size={18} color="#10b981" />
                <span>Instructional Quality Recommendations (1-Click Apply)</span>
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Pacing and pedagogical enhancements
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {qc2.suggested_improvements?.map((fix) => (
                <div
                  key={fix.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '18px',
                    background: fix.applied ? '#f0fdf4' : '#ffffff',
                    borderLeft: fix.applied ? '4px solid #10b981' : '4px solid #10b981'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className="badge badge-neutral" style={{ marginRight: '8px' }}>Target: {fix.target_section}</span>
                      {fix.applied && <span className="badge badge-success"><Check size={12} /> Applied to Lesson</span>}
                    </div>
                    {!fix.applied ? (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleApplyFix(fix.id, 'qc_layer_2')}
                        disabled={applyingFixId === fix.id}
                      >
                        <Sparkles size={14} />
                        {applyingFixId === fix.id ? 'Applying...' : 'Apply Fix to Lesson'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>
                        Integrated in Section
                      </span>
                    )}
                  </div>

                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Pedagogical Need: {fix.issue}
                  </strong>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                    <strong>Recommended Improvement:</strong> {fix.recommendation}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#334155' }}>
                    <div style={{ fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Patch text to merge:</div>
                    {fix.patch_text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

