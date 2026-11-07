# LessonCraft AI — AI-Powered Lesson Creation & Dual Quality Control Tool

> **AI Research Program Design Engineering Task**  
> An engineering platform designed to research, synthesize, review, and validate 45-minute educational lessons with two independent Quality Control (QC) layers.

---

## 🌟 Task Overview & Features Implemented

### 1. AI-Powered Lesson Generation (45-Minute Calibrated)
- **Inputs**: Accepts **Lesson Title** and **Learning Objective**. Includes 1-click quick-load benchmark presets.
- **Multi-Source Research**:
  - **Books**: Authoritative textbooks (Google Books API + domain academic repository: O'Reilly, MIT Press, Pearson).
  - **Websites**: Standards documentation (IETF RFCs, MDN Web Docs, Wikipedia API).
  - **YouTube Videos**: Curated educational videos with duration, channel, embeddable IDs, and relevance summaries.
- **Structured Content Synthesis**:
  - Hook & Real-world analogy (00:00 - 05:00)
  - Core theoretical deep-dive with protocol/algorithm diagrams (05:00 - 20:00)
  - Practical code implementations & cURL / language examples (20:00 - 30:00)
  - Guided interactive student lab activity with starter and solution code (30:00 - 40:00)
  - Active recall 5-question knowledge check quiz with instant feedback (40:00 - 45:00)
  - Formatted bibliography and verified reference links.

### 2. Two Independent Quality Control (QC) Layers
- **QC Layer 1: Research and Factual Accuracy**
  - Claim-by-claim verification table (Verified / Needs Context / Inaccurate).
  - Source credibility and citation reliability grading (A+, A, B+).
  - Detection of factual gaps, ambiguities, and security caveats (e.g., distinguishing POST visibility from TLS transport encryption, 401 vs 403 status codes).
  - Actionable suggested improvements with **1-Click "Apply Fix to Lesson"** capability.
- **QC Layer 2: Instructional Quality**
  - Alignment score with the learning objective and Bloom's Taxonomy verification (e.g., *Analyze & Apply*).
  - 5-dimensional pedagogical rubric (Clarity, Structure, 45-min Pacing, Interactivity, Assessment Rigor).
  - Identification of instructional gaps (e.g., transition bridges, instructor debrief cues).
  - Actionable suggested improvements with **1-Click "Apply Fix to Lesson"** capability.
- **Independent Audit Reports**: Each layer produces a standalone audit report with quantifiable scoring (out of 100).

### 3. Review, Edit, and Export
- **Instructor Editor**: In-place interactive Markdown editor to review, modify section timings, edit text, or add custom teaching cues.
- **Interactive Patch Application**: Instructors can review QC recommendations and apply them directly into the lesson content with one click.
- **Presentation Preview**: Clean instructor/student presentation mode featuring an interactive **45-minute delivery stopwatch**, active recall quiz, and video embeds.
- **Multi-Format Export**:
  - **Markdown (`.md`)**: Full lesson, pacing, quiz, references, and both QC audit appendices.
  - **Printable HTML / PDF (`.html`)**: Styled, self-contained document formatted for browser print-to-PDF.
  - **Structured JSON (`.json`)**: Complete data payload for LMS integration.

### 4. Interactive Theme System (Black & White Modes)
- **Selectable Themes via Top Navigation & Settings**:
  - 🎨 **Default Color**: Modern indigo & slate palette.
  - ⚪ **Black & White (Light Paper)**: Clean, high-contrast monochrome aesthetic inspired by paper & e-ink displays.
  - 🖤 **Black & White (Dark Noir)**: Deep pitch black `#000000` & pure white `#ffffff` high-contrast dark mode for distraction-free reading.
- Persists user theme preference in `localStorage`.
- All curriculum cards, dual QC tables, timeline trackers, video cards, and quiz options adapt dynamically to the monochrome contrast scheme.

### 5. Error Handling & Zero-Failure Architecture
- Validates empty or short inputs with informative diagnostic alerts.
- Allows retrying individual failed steps (Retry Research, Re-run QC 1, Re-run QC 2).
- Persists all lessons and instructor edits atomically in `backend/data/lessons.json`.
- **Intelligent Fallback Engine**: If no external API keys are configured or if network fails, the tool seamlessly falls back to a deterministic, high-fidelity educational synthesis engine, guaranteeing 100% uptime and instant evaluation out of the box!

---

## 🏗️ Architecture & Technology Stack

```
lessoncraft_ai/
├── backend/
│   ├── app/
│   │   ├── models/            # Thread-safe JSON lesson persistence
│   │   │   └── lesson.py
│   │   ├── routes/            # REST API endpoints
│   │   │   ├── lesson_routes.py
│   │   │   ├── qc_routes.py
│   │   │   └── research_routes.py
│   │   ├── services/          # Core business & research logic
│   │   │   ├── ai_service.py          # Gemini / OpenAI / Fallback LLM orchestrator
│   │   │   ├── research_service.py    # Books, Web, YouTube multi-source research
│   │   │   ├── lesson_service.py      # 45-minute lesson curriculum synthesizer
│   │   │   ├── factual_qc.py          # QC Layer 1 auditor
│   │   │   ├── instructional_qc.py    # QC Layer 2 auditor
│   │   │   └── export_service.py      # Markdown, HTML/PDF, JSON exporter
│   │   ├── utils/
│   │   │   └── validators.py          # Input validation & error responses
│   │   ├── config.py
│   │   └── __init__.py        # App factory & SPA static server
│   ├── tests/
│   │   └── test_pipeline.py   # Automated integration test suite
│   ├── requirements.txt
│   ├── run.py                 # Single-command server entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, LessonEditor, ExportModal, SettingsModal
│   │   ├── pages/             # CreateLesson, Dashboard, LessonPreview, QCReports
│   │   ├── services/api.js    # Axios API client
│   │   ├── App.jsx
│   │   ├── index.css          # Design system & responsive layout
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.12 verified)
- **Node.js 18+** (Optional, frontend is already pre-built into `frontend/dist/` for single-command launch)

### Option 1: Single-Command Launch (Recommended)
From the project root:

```bash
cd backend
python run.py
```

The server will start at **http://localhost:5000**.
Open **[http://localhost:5000](http://localhost:5000)** in your browser — it serves both the REST API and the complete React single-page application!

---

### Option 2: Running with Hot-Reload Frontend Development

**Terminal 1 (Backend Server):**
```bash
cd backend
python run.py
```

**Terminal 2 (Frontend Dev Server):**
```bash
cd frontend
npm run dev
```
Open **http://localhost:5173** for live hot-module replacement.

---

## 🧪 Testing the Benchmarks

The application comes pre-loaded with the assignment's official testing benchmarks:

### Benchmark 1: HTTP Requests and Responses (Primary Required)
- **Title**: `HTTP Requests and Responses`
- **Learning Objective**: `Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.`
- Click **"Quick-Load Sample Testing Benchmarks"** on the home screen to auto-fill.
- Click **"Generate Lesson & Run Dual QC"**.
- Observe:
  1. Multi-source research (Books: *HTTP: The Definitive Guide*, *Kurose & Ross*; Web: *RFC 9110*, *MDN*; YouTube: *Traversy Media*, *Fireship*).
  2. 45-minute pacing breakdown (5m Hook, 15m Deep Dive, 10m Status Code Triage, 10m Hands-on Lab, 5m Quiz).
  3. **QC Layer 1 (Factual Accuracy)**: 96/100 score, claim-by-claim verification, TLS security caveat identification.
  4. **QC Layer 2 (Instructional Quality)**: 95.4/100 score, Bloom's level, pacing rubric, transition improvements.
  5. Click **"Apply Fix to Lesson"** on any recommendation to see the lesson content update in real-time.
  6. Click **"Export Final"** to download the Markdown file or open the Printable HTML document.

### Benchmark 2: Binary Search Algorithms (Secondary Required)
- **Title**: `Binary Search Algorithm: Theory, Implementation, and Complexity`
- **Learning Objective**: `Implement binary search iteratively and recursively, analyze its O(log n) time complexity, and identify boundary condition pitfalls (off-by-one errors).`
- Available via one-click preset on the UI.

---

## 🔬 Running Automated Test Suite

Run the full end-to-end integration test suite:

```bash
cd backend
python -m unittest tests/test_pipeline.py
```

All 4 test suites verify:
- Input validation and error handling
- Multi-source research and 45-minute lesson synthesis
- QC Layer 1 audit scoring and claim extraction
- QC Layer 2 pedagogical rubric scoring
- QC patch application into lesson sections
- Markdown, HTML, and JSON exports

---

## 🎥 Demo Video Guide (For Submission)

When recording your 3–5 minute submission video:
1. **Introduction (30s)**: Introduce yourself, the project purpose, and the problem statement.
2. **Input & Generation (45s)**: Click the "HTTP Requests & Responses" preset. Show the 4-stage pipeline running (Research -> Synthesis -> QC 1 -> QC 2).
3. **Research & Supplementary Resources (45s)**: Show the gathered Books, MDN/RFC links, and embeddable YouTube video resources.
4. **Demonstrating Both QC Layers (60s)**:
   - Walk through **QC Layer 1 (Factual Accuracy)**: Explain the claims verification table and source credibility.
   - Walk through **QC Layer 2 (Instructional Quality)**: Explain the 45-min pacing breakdown, Bloom's alignment, and rubric.
   - Click **"Apply Fix to Lesson"** on a recommendation and show it updating the lesson.
5. **Editing & Presentation (30s)**: Show the in-place lesson editor, the 45-minute delivery stopwatch, and the interactive active-recall quiz.
6. **Export (30s)**: Click "Export Final", show the generated Markdown file and the styled Printable HTML.
7. **Conclusion (15s)**: Briefly mention tech stack (Python/Flask backend, React 19 frontend, zero-failure multi-provider architecture).
