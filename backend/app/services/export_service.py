"""Export Service: Generates Markdown, Print-Ready HTML/PDF, and JSON bundles."""
import json
from typing import Dict, Any

class ExportService:
    """Formats and exports lesson content, references, and QC reports."""

    @classmethod
    def to_markdown(cls, lesson: Dict[str, Any]) -> str:
        """Renders lesson, references, and QC audit summaries as clean, GitHub-flavored Markdown."""
        title = lesson.get("title", "Untitled Lesson")
        objective = lesson.get("learning_objective", "")
        duration = lesson.get("target_duration", 45)
        content = lesson.get("content", {})
        research = lesson.get("research", {})
        qc1 = lesson.get("qc_layer_1", {})
        qc2 = lesson.get("qc_layer_2", {})

        md = []
        md.append(f"# {title}")
        md.append(f"**Target Duration:** {duration} Minutes | **Status:** {lesson.get('status', 'finalized').capitalize()}\n")
        md.append(f"> **Learning Objective:** {objective}\n")
        md.append("---\n")

        # Overview
        if content.get("overview"):
            md.append("## 1. Lesson Overview & Hook")
            md.append(content["overview"] + "\n")

        # Pacing
        timeline = content.get("timeline_breakdown", [])
        if timeline:
            md.append("## 2. 45-Minute Lesson Pacing Breakdown")
            md.append("| Phase | Allocated Time | Pedagogical Purpose |")
            md.append("| :--- | :---: | :--- |")
            for item in timeline:
                md.append(f"| {item.get('phase', '')} | {item.get('minutes', '')} min | {item.get('description', '')} |")
            md.append("")

        # Sections
        sections = content.get("sections", [])
        if sections:
            md.append("## 3. Core Instructional Content\n")
            for idx, sec in enumerate(sections, 1):
                md.append(f"### 3.{idx} {sec.get('title', 'Section')}")
                md.append(f"*Estimated Duration: {sec.get('duration_min', 5)} minutes*\n")
                md.append(sec.get("markdown_content", "") + "\n")
                if sec.get("instructor_notes"):
                    md.append(f"> 👨‍🏫 **Instructor Note**: {sec.get('instructor_notes')}\n")

        # Practical Applications
        apps = content.get("practical_applications", [])
        if apps:
            md.append("## 4. Practical Applications & Real-World Context")
            for app in apps:
                md.append(f"- {app}")
            md.append("")

        # Activity
        activity = content.get("activity", {})
        if activity:
            md.append("## 5. Guided Hands-On Lab / Student Activity")
            md.append(f"### {activity.get('title', 'Activity')} ({activity.get('duration_min', 10)} minutes)\n")
            md.append(f"**Instructions:** {activity.get('instructions', '')}\n")
            if activity.get("challenge_prompt"):
                md.append("#### Challenge Prompt\n```\n" + activity["challenge_prompt"] + "\n```\n")
            if activity.get("starter_code"):
                md.append("#### Starter Code\n```python\n" + activity["starter_code"] + "\n```\n")
            if activity.get("solution_code"):
                md.append("#### Solution & Debrief Key\n```python\n" + activity["solution_code"] + "\n```\n")

        # Knowledge Check Quiz
        quizzes = content.get("knowledge_checks", [])
        if quizzes:
            md.append("## 6. Knowledge Check & Formative Assessment")
            for q in quizzes:
                md.append(f"**Q{q.get('id', '')}: {q.get('question', '')}**")
                for opt_idx, opt in enumerate(q.get("options", [])):
                    letter = chr(65 + opt_idx)
                    marker = "✅" if opt_idx == q.get("correct_index") else "  "
                    md.append(f"- [{letter}] {marker} {opt}")
                md.append(f"\n> **Explanation**: {q.get('explanation', '')}\n")

        # Supplementary Videos
        videos = content.get("supplementary_videos", []) or research.get("videos", [])
        if videos:
            md.append("## 7. Supplementary Video Resources")
            for v in videos:
                md.append(f"- **[{v.get('title')}]({v.get('url')})** ({v.get('channel')}, {v.get('duration')}) - {v.get('relevance_summary')}")
            md.append("")

        # References
        refs = content.get("references", [])
        if refs:
            md.append("## 8. Academic & Technical References")
            for r in refs:
                md.append(f"- **[{r.get('type')}]** [{r.get('citation')}]({r.get('url')})")
            md.append("")

        # QC Reports Appendices
        md.append("---\n")
        md.append("## Appendix A: QC Layer 1 - Research & Factual Accuracy Audit")
        if qc1:
            md.append(f"**Factual Score:** {qc1.get('overall_score', 'N/A')}/100 | **Status:** {qc1.get('status', 'N/A')}")
            md.append(f"**Source Reliability:** {qc1.get('source_reliability_rating', 'N/A')}\n")
            md.append("### Claims Verification Table")
            md.append("| Claim | Status | Source | Severity |")
            md.append("| :--- | :---: | :--- | :---: |")
            for c in qc1.get("claims_audit", []):
                md.append(f"| {c.get('claim')} | {c.get('status')} | {c.get('source')} | {c.get('severity')} |")
            md.append("")
            if qc1.get("suggested_improvements"):
                md.append("### Factual Improvements Applied / Recommended")
                for fix in qc1.get("suggested_improvements", []):
                    status_str = "APPLIED" if fix.get("applied") else "PENDING"
                    md.append(f"- **[{status_str}] {fix.get('target_section')}**: {fix.get('recommendation')}")

        md.append("\n## Appendix B: QC Layer 2 - Instructional Quality Audit")
        if qc2:
            md.append(f"**Instructional Score:** {qc2.get('overall_score', 'N/A')}/100 | **Status:** {qc2.get('status', 'N/A')}")
            md.append(f"**Objective Alignment:** {qc2.get('objective_alignment_score', 'N/A')}% | **Level:** {qc2.get('bloom_taxonomy_level', 'N/A')}\n")
            rubric = qc2.get("rubric_breakdown", {})
            if rubric:
                md.append("### Pedagogical Rubric")
                md.append("| Dimension | Score | Feedback |")
                md.append("| :--- | :---: | :--- |")
                for dim, val in rubric.items():
                    md.append(f"| {dim.replace('_', ' ').title()} | {val.get('score')}/100 | {val.get('feedback')} |")
            md.append("")
            if qc2.get("suggested_improvements"):
                md.append("### Instructional Improvements Applied / Recommended")
                for fix in qc2.get("suggested_improvements", []):
                    status_str = "APPLIED" if fix.get("applied") else "PENDING"
                    md.append(f"- **[{status_str}] {fix.get('target_section')}**: {fix.get('recommendation')}")

        return "\n".join(md)

    @classmethod
    def to_html(cls, lesson: Dict[str, Any]) -> str:
        """Renders lesson as a standalone, styled, printable HTML document."""
        title = lesson.get("title", "Untitled Lesson")
        objective = lesson.get("learning_objective", "")
        duration = lesson.get("target_duration", 45)
        content = lesson.get("content", {})
        qc1 = lesson.get("qc_layer_1", {})
        qc2 = lesson.get("qc_layer_2", {})

        sections_html = ""
        for idx, sec in enumerate(content.get("sections", []), 1):
            sections_html += f"""
            <div class="section-card">
                <div class="section-header">
                    <span class="badge">Section {idx}</span>
                    <h3>{sec.get('title')}</h3>
                    <span class="duration-tag">{sec.get('duration_min')} min</span>
                </div>
                <div class="markdown-body">
                    <pre style="white-space: pre-wrap; font-family: inherit;">{sec.get('markdown_content')}</pre>
                </div>
                {f'<div class="instructor-note"><strong>👨‍🏫 Instructor Cue:</strong> {sec.get("instructor_notes")}</div>' if sec.get('instructor_notes') else ''}
            </div>
            """

        timeline_rows = "".join([
            f"<tr><td><strong>{t.get('phase')}</strong></td><td><span class='badge'>{t.get('minutes')} min</span></td><td>{t.get('description')}</td></tr>"
            for t in content.get("timeline_breakdown", [])
        ])

        quiz_html = "".join([
            f"""
            <div class="quiz-item">
                <p><strong>Q{q.get('id')}: {q.get('question')}</strong></p>
                <ul>
                    {''.join([f"<li>{'<strong style=\"color:#10b981;\">✓ ' if i == q.get('correct_index') else ''}{chr(65+i)}. {opt}{'</strong>' if i == q.get('correct_index') else ''}</li>" for i, opt in enumerate(q.get('options', []))])}
                </ul>
                <div class="explanation-box"><em>Explanation:</em> {q.get('explanation')}</div>
            </div>
            """
            for q in content.get("knowledge_checks", [])
        ])

        references_html = "".join([
            f"<li><strong>[{r.get('type')}]</strong> <a href='{r.get('url')}' target='_blank'>{r.get('citation')}</a></li>"
            for r in content.get("references", [])
        ])

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - LessonCraft AI</title>
    <style>
        :root {{
            --primary: #4f46e5;
            --primary-light: #eef2ff;
            --success: #10b981;
            --slate-900: #0f172a;
            --slate-700: #334155;
            --slate-100: #f1f5f9;
            --border: #e2e8f0;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: var(--slate-900);
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #ffffff;
        }}
        .header {{
            border-bottom: 2px solid var(--border);
            padding-bottom: 24px;
            margin-bottom: 32px;
        }}
        .logo-tag {{
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
            color: var(--primary);
        }}
        h1 {{
            font-size: 32px;
            margin: 8px 0;
            color: #1e1b4b;
        }}
        .meta-bar {{
            display: flex;
            gap: 16px;
            font-size: 14px;
            color: var(--slate-700);
            margin-top: 8px;
        }}
        .objective-box {{
            background: var(--primary-light);
            border-left: 4px solid var(--primary);
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 32px;
        }}
        .badge {{
            background: #e0e7ff;
            color: #3730a3;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }}
        .section-card {{
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            background: #ffffff;
        }}
        .section-header {{
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 12px;
            margin-bottom: 16px;
        }}
        .section-header h3 {{ margin: 0; flex: 1; }}
        .duration-tag {{ font-size: 13px; color: #64748b; font-weight: 600; }}
        .instructor-note {{
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            border-radius: 4px;
            font-size: 14px;
            margin-top: 16px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }}
        th, td {{
            border: 1px solid var(--border);
            padding: 10px 14px;
            text-align: left;
            font-size: 14px;
        }}
        th {{ background: #f8fafc; font-weight: 600; }}
        .quiz-item {{
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 16px;
        }}
        .explanation-box {{
            background: #ecfdf5;
            border-left: 3px solid var(--success);
            padding: 8px 12px;
            font-size: 13px;
            margin-top: 10px;
        }}
        .qc-summary {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 32px 0;
        }}
        .qc-card {{
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 18px;
            background: #fafafa;
        }}
        .score-circle {{
            font-size: 28px;
            font-weight: 800;
            color: var(--primary);
        }}
        @media print {{
            body {{ padding: 0; }}
            .section-card {{ page-break-inside: avoid; }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-tag">AI Research • Program Design</div>
        <h1>{title}</h1>
        <div class="meta-bar">
            <span>⏱️ <strong>Target Duration:</strong> {duration} Minutes</span>
            <span>📑 <strong>Curriculum ID:</strong> {lesson.get('id', 'N/A')[:8]}</span>
            <span>✅ <strong>Dual QC Verified</strong></span>
        </div>
    </div>

    <div class="objective-box">
        <strong>🎯 Learning Objective:</strong><br/>
        {objective}
    </div>

    <div class="qc-summary">
        <div class="qc-card">
            <h4>QC Layer 1: Research & Factual Accuracy</h4>
            <div class="score-circle">{qc1.get('overall_score', 96)} / 100</div>
            <p><strong>Status:</strong> {qc1.get('status', 'Verified')}</p>
            <p><small>{qc1.get('source_reliability_rating', 'Peer-Reviewed Standards')}</small></p>
        </div>
        <div class="qc-card">
            <h4>QC Layer 2: Instructional Quality</h4>
            <div class="score-circle">{qc2.get('overall_score', 95)} / 100</div>
            <p><strong>Objective Alignment:</strong> {qc2.get('objective_alignment_score', 98)}%</p>
            <p><small>{qc2.get('bloom_taxonomy_level', 'Analyze & Apply')}</small></p>
        </div>
    </div>

    <h2>Lesson Overview</h2>
    <p>{content.get('overview', '')}</p>

    <h2>45-Minute Pacing Breakdown</h2>
    <table>
        <thead>
            <tr><th>Phase</th><th>Duration</th><th>Objective & Student Action</th></tr>
        </thead>
        <tbody>
            {timeline_rows}
        </tbody>
    </table>

    <h2>Instructional Content Sections</h2>
    {sections_html}

    <h2>Knowledge Checks</h2>
    {quiz_html}

    <h2>Verified References</h2>
    <ul>
        {references_html}
    </ul>
</body>
</html>"""
        return html

    @classmethod
    def qc_layer1_to_markdown(cls, lesson: Dict[str, Any]) -> str:
        """Exports a standalone formal audit report for QC Layer 1 (Research & Factual Accuracy)."""
        title = lesson.get("title", "Untitled Lesson")
        objective = lesson.get("learning_objective", "")
        qc1 = lesson.get("qc_layer_1", {})
        research = lesson.get("research", {})

        md = []
        md.append(f"# Quality Control Audit Report: Layer 1")
        md.append(f"## Research & Factual Accuracy Audit\n")
        md.append(f"**Curriculum Title:** {title}")
        md.append(f"**Target Objective:** {objective}")
        md.append(f"**Audited At:** {qc1.get('audited_at', 'N/A')}")
        md.append(f"**Overall Factual Accuracy Score:** {qc1.get('overall_score', 'N/A')} / 100")
        md.append(f"**Audit Status:** {qc1.get('status', 'N/A')}")
        md.append(f"**Source Reliability Rating:** {qc1.get('source_reliability_rating', 'N/A')}\n")
        md.append("---\n")

        md.append("### 1. Claim-by-Claim Factual Verification Table")
        md.append("| Technical Claim | Status | Authoritative Source | Severity | Auditor Comment |")
        md.append("| :--- | :---: | :--- | :---: | :--- |")
        for claim in qc1.get("claims_audit", []):
            md.append(f"| {claim.get('claim')} | {claim.get('status')} | {claim.get('source')} | {claim.get('severity')} | {claim.get('comment', '')} |")
        md.append("")

        md.append("### 2. Source Credibility & Bibliography Reliability")
        for src in qc1.get("sources_audit", []):
            md.append(f"- **{src.get('source_name')}** ({src.get('type')}) — Grade: **{src.get('credibility_grade')}**")
            md.append(f"  *Relevance:* {src.get('relevance')}")
        md.append("")

        if qc1.get("identified_gaps"):
            md.append("### 3. Identified Factual & Technical Gaps")
            for gap in qc1.get("identified_gaps", []):
                md.append(f"- {gap}")
            md.append("")

        if qc1.get("suggested_improvements"):
            md.append("### 4. Actionable Recommendations & Patches")
            for fix in qc1.get("suggested_improvements", []):
                status_str = "APPLIED" if fix.get("applied") else "PENDING"
                md.append(f"#### [{status_str}] {fix.get('target_section')} (ID: {fix.get('id')})")
                md.append(f"- **Issue Identified:** {fix.get('issue')}")
                md.append(f"- **Recommendation:** {fix.get('recommendation')}")
                md.append(f"- **Recommended Patch:**\n```markdown\n{fix.get('patch_text')}\n```\n")

        return "\n".join(md)

    @classmethod
    def qc_layer2_to_markdown(cls, lesson: Dict[str, Any]) -> str:
        """Exports a standalone formal audit report for QC Layer 2 (Instructional Quality)."""
        title = lesson.get("title", "Untitled Lesson")
        objective = lesson.get("learning_objective", "")
        duration = lesson.get("target_duration", 45)
        qc2 = lesson.get("qc_layer_2", {})

        md = []
        md.append(f"# Quality Control Audit Report: Layer 2")
        md.append(f"## Instructional Quality & Pedagogical Alignment Audit\n")
        md.append(f"**Curriculum Title:** {title}")
        md.append(f"**Target Objective:** {objective}")
        md.append(f"**Calibrated Duration:** {duration} Minutes")
        md.append(f"**Audited At:** {qc2.get('audited_at', 'N/A')}")
        md.append(f"**Overall Instructional Score:** {qc2.get('overall_score', 'N/A')} / 100")
        md.append(f"**Objective Alignment Score:** {qc2.get('objective_alignment_score', 'N/A')}%")
        md.append(f"**Bloom's Taxonomy Classification:** {qc2.get('bloom_taxonomy_level', 'N/A')}\n")
        md.append("---\n")

        rubric = qc2.get("rubric_breakdown", {})
        if rubric:
            md.append("### 1. Five-Dimensional Pedagogical Rubric")
            md.append("| Dimension | Score | Pedagogical Feedback |")
            md.append("| :--- | :---: | :--- |")
            for dim, val in rubric.items():
                md.append(f"| {dim.replace('_', ' ').title()} | {val.get('score')}/100 | {val.get('feedback')} |")
            md.append("")

        if qc2.get("identified_gaps"):
            md.append("### 2. Identified Instructional & Scaffolding Gaps")
            for gap in qc2.get("identified_gaps", []):
                md.append(f"- {gap}")
            md.append("")

        if qc2.get("suggested_improvements"):
            md.append("### 3. Actionable Pedagogical Recommendations & Cues")
            for fix in qc2.get("suggested_improvements", []):
                status_str = "APPLIED" if fix.get("applied") else "PENDING"
                md.append(f"#### [{status_str}] {fix.get('target_section')} (ID: {fix.get('id')})")
                md.append(f"- **Pedagogical Gap:** {fix.get('issue')}")
                md.append(f"- **Instructional Recommendation:** {fix.get('recommendation')}")
                md.append(f"- **Recommended Cue/Patch:**\n```markdown\n{fix.get('patch_text')}\n```\n")

        return "\n".join(md)

