# 🎯 InterviewIQ — AI Mock Interview System
## Hackathon Build Plan · Zero-Cost Stack · Agentic AI

---

> **Design Philosophy:** "Digital Living Room meets Career Studio" — the Softly aesthetic applied to career growth. Warm, tactile, intentionally calm — because nervous candidates deserve a space that breathes.

---

## 📐 Design System (Softly Style — Adapted)

```
Color Palette
─────────────────────────────────────────────────────
Background:     #FDFCF8   (warm off-white canvas)
Sage:           #E8EFE8   (calm section backgrounds)
Lavender:       #EFEDF4   (secondary panels)
Coral Accent:   #FFB7B2   (primary CTA, highlights)
Dark Text:      #292524   (headings, strong text)
Muted Text:     #78716C   (subtitles, labels)

Typography
─────────────────────────────────────────────────────
Primary:        'Outfit' (Google Fonts, rounded sans)
Accent:         'Reenie Beanie' (Google Fonts, cursive)
Headings:       48–96px, tracking-tight (-0.025em)
Body:           16–18px, weight 400–500

Visual Effects
─────────────────────────────────────────────────────
Grain Overlay:  SVG feTurbulence, baseFreq 0.65, opacity 0.35
Border Radius:  2rem–4rem on all containers
Shadows:        0 4px 20px -2px rgba(0,0,0,0.05)
Blobs:          60% opacity #FFE4E1 + #E6E6FA, blur-3xl
Nav:            Floating pill, 70% white, backdrop-blur-xl

Animations
─────────────────────────────────────────────────────
Scroll Reveal:  translateY(30px→0) + opacity(0→1), 0.8s ease
Blob Float:     translateY ±10px, 6s loop
Hover Scale:    scale(1.02), 200ms ease
Active Pulse:   Coral ring pulse on recording state
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                 │
│  Landing → Onboarding → Live Interview Room → Dashboard         │
│  Softly Design System · Web Speech API · MediaPipe Vision       │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST + WebSocket
┌────────────────────────▼────────────────────────────────────────┐
│                    BACKEND (FastAPI / Python)                   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ Resume Agent │  │ Orchestrator │  │  Evaluator Agent    │   │
│  │  (Parse +    │  │   Agent      │  │  (Score + Roadmap)  │   │
│  │  Skill Map)  │  │  (Controls   │  │                     │   │
│  └──────────────┘  │   Flow)      │  └─────────────────────┘   │
│                    └──────────────┘                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                        AI LAYER (100% Free)                     │
│                                                                  │
│  Gemini 2.5 Pro Live  →  Real-time voice interview (WebSocket)  │
│  Gemini 2.0 Flash     →  Evaluation, scoring, feedback          │
│  MiniMax-2.5 (OpenRouter) → Question generation, resume parse   │
│  Nemotron (OpenRouter)    → HR personality simulation           │
│  MediaPipe (browser)      → Eye contact, posture detection      │
│  Web Speech API (browser) → STT transcription (free)           │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      DATABASE (Supabase Free Tier)              │
│  Users · Sessions · Transcripts · Scores · Question Bank       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agentic AI Design (20 Marks — Core Focus)

This is **not a chatbot**. Each agent has a goal, memory, and decision loop.

### Agent 1 — ResumeIntel Agent
```
Goal:     Parse resume → extract skills, gaps, target role
Input:    PDF/text resume + desired job role
Process:  MiniMax-2.5 via OpenRouter
          → Extract: tech stack, projects, experience level
          → Generate: skill confidence map (1–10 per skill)
          → Identify: weak areas to probe during interview
Output:   Structured JSON profile fed to Orchestrator
Memory:   Stored in Supabase, reused across sessions
```

### Agent 2 — Orchestrator Agent *(The Brain)*
```
Goal:     Run interview like a real interviewer — adapts in real-time
Triggers: 
  IF answer_score < 5  → increase hint level, simplify follow-up
  IF answer_score > 8  → escalate difficulty by one tier
  IF topic_exhausted   → pivot to next domain
  IF time > 25min      → trigger closing round
  IF confidence_low    → insert encouragement + easier warmup

Decision Tree:
  [Intro] → [Warm-up HR] → [Technical Core] → [Situational]
           ↑ Adapts depth ↑                  → [Closing + Feedback]

Model:    Gemini 2.5 Pro Live (real-time voice)
          + Gemini Flash (between-question scoring)
```

### Agent 3 — RealTime Evaluator Agent
```
Goal:     Score every answer on 4 axes as it's being spoken
Runs:     After each answer (async, while next question plays)

Scoring:
  Technical Accuracy  (0–10)  → factual correctness
  Communication       (0–10)  → clarity, structure, STAR format
  Confidence Proxy    (0–10)  → speech pace, filler words (um/uh)
  Depth               (0–10)  → detail level, examples given

Input:    Transcript (Web Speech API) + MediaPipe signals
Model:    Gemini 2.0 Flash (fast, free)
Output:   Per-question score JSON → stored → shown post-interview
```

### Agent 4 — RoadmapCraft Agent
```
Goal:     Generate personalized 30-day prep plan post-interview
Input:    Aggregated scores + skill profile + weak topics
Process:  Nemotron (OpenRouter free) — narrative generation
Output:
  - Top 3 critical gaps
  - Daily study schedule (resource links: GFG, LeetCode, YouTube)
  - 5 practice questions per weak topic
  - "Next session focus" recommendation
Trigger:  Auto-runs 2 min after interview ends
```

### Agent 5 — QuestionBank Agent
```
Goal:     Maintain + grow a dynamic question bank
Roles:    SDE · Data Analyst · Product · HR · System Design
Tiers:    Beginner → Intermediate → Advanced → Expert
Source:   Pre-seeded 500+ questions + Gemini Flash generation
Tagging:  Topic · Difficulty · Expected keywords · Ideal answer
```

---

## 📅 Build Phases

---

### 🔷 Phase 0 — Setup & Repo (Day 1 · 2 hours)

```bash
# Project Structure
interviewiq/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── design/    # Softly tokens, grain overlay, blobs
│   │   ├── pages/     # Landing, Onboard, Interview, Dashboard
│   │   └── components/
├── backend/           # FastAPI (Python 3.11)
│   ├── agents/        # One file per agent
│   ├── routers/       # API endpoints
│   └── db/            # Supabase client
└── docker-compose.yml
```

**Setup Checklist:**
- [ ] Vite + React + Tailwind CSS + shadcn/ui
- [ ] Import `Outfit` + `Reenie Beanie` from Google Fonts
- [ ] FastAPI project with uvicorn
- [ ] Supabase project (free) → create tables
- [ ] OpenRouter API key (free tier)
- [ ] Google AI Studio key (Gemini — free)
- [ ] Environment variables configured

**Supabase Schema:**
```sql
users(id, name, email, resume_json, created_at)
sessions(id, user_id, role, mode, started_at, ended_at)
answers(id, session_id, question, transcript, scores_json)
roadmaps(id, user_id, session_id, plan_json, created_at)
questions(id, role, tier, topic, text, keywords, ideal_answer)
```

---

### 🔷 Phase 1 — Softly UI Shell (Day 1 · 4 hours)

**Pages to build:**

#### 1.1 Landing Page
```
┌─────────────────────────────────────┐
│  🟣 Floating Pill Nav               │
│     Logo · Features · About · Start │
├─────────────────────────────────────┤
│                                     │
│  [blob #FFE4E1]   [blob #E6E6FA]    │
│                                     │
│   Practice smarter,                 │
│   crack interviews                  │
│   with  confidence ✦               │  ← Reenie Beanie on "confidence"
│                                     │
│  [Start Free →]  [Watch Demo]       │
│                                     │
├─────────────────────────────────────┤
│  ← Horizontal scroll feature cards →│
│  "Resume → Questions" "Voice AI"    │
│  "Instant Feedback" "30-Day Plan"   │
├─────────────────────────────────────┤
│  Testimonial cards (±1° rotation)   │
│  "Scored 8.7/10 on my SDE round"   │
├─────────────────────────────────────┤
│  Email CTA · Grain overlay global   │
└─────────────────────────────────────┘
```

#### 1.2 Onboarding Flow (3 steps)
```
Step 1: Upload Resume (drag & drop, Coral accent)
Step 2: Select Role (SDE / Data / PM / HR — pill selectors)
Step 3: Choose Mode (Voice / Text / Both)
→ "Building your profile..." (animated blob loader)
→ Redirects to Interview Room
```

#### 1.3 Interview Room
```
┌─────────────────────────────────────┐
│  Timer [24:37]    Confidence: ████░ │
├──────────────────┬──────────────────┤
│                  │                  │
│   AI Interviewer │   Your Camera    │
│   Avatar (SVG    │   Feed           │
│   animated)      │   (MediaPipe     │
│                  │   overlay)       │
├──────────────────┴──────────────────┤
│  "Tell me about a time you..."      │ ← Current question
│  ─────────────────────────────────  │
│  [🔴 Recording...  ][Skip][End]     │
│                                     │
│  Live transcript appearing here...  │
└─────────────────────────────────────┘
```

#### 1.4 Dashboard
```
Tabs: Overview · History · Roadmap · Question Bank

Overview:
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │Tech 7.2│ │Comm 8.1│ │Conf 6.9│ │Depth 7│
  └────────┘ └────────┘ └────────┘ └────────┘
  
  Progress chart (last 5 sessions, line chart)
  Top weak topics (horizontal bar)
  "Your 30-Day Roadmap" expandable card
```

**Key UI Components to build:**
- `GrainOverlay.jsx` — fixed SVG noise layer, z-50, pointer-none
- `FloatingBlob.jsx` — animated background gradient blobs
- `PillNav.jsx` — floating glass nav
- `ScoreRing.jsx` — animated SVG circle score display
- `InterviewAvatar.jsx` — speaking/thinking state SVG animation
- `RoadmapCard.jsx` — accordion-style 30-day plan

---

### 🔷 Phase 2 — Resume Agent + Question Pipeline (Day 1–2 · 3 hours)

**2.1 Resume Parser (POST /api/resume/parse)**
```python
# backend/agents/resume_agent.py

async def parse_resume(pdf_text: str, target_role: str) -> dict:
    prompt = f"""
    You are a technical recruiter. Parse this resume for a {target_role} role.
    Return ONLY valid JSON with:
    {{
      "name": str,
      "experience_years": int,
      "skills": [{{"name": str, "confidence": 1-10}}],
      "projects": [str],
      "weak_areas": [str],
      "suggested_difficulty": "beginner|intermediate|advanced"
    }}
    Resume: {pdf_text}
    """
    # Call MiniMax-2.5 via OpenRouter
    response = await openrouter_call("minimax/minimax-m1", prompt)
    return json.loads(response)
```

**2.2 Question Generator (POST /api/questions/generate)**
```python
# Generates 20 questions per session
# 5 HR warm-up → 10 Technical (adaptive) → 3 Situational → 2 Closing

async def generate_session_questions(profile: dict) -> list[Question]:
    # Pull from Supabase bank first (fast)
    # Fill gaps with Gemini Flash generation
    # Order by: HR → Easy Tech → Hard Tech → Situational
    pass
```

---

### 🔷 Phase 3 — Live Interview Engine (Day 2 · 5 hours)

**This is the hackathon's crown jewel — the Agentic AI loop.**

**3.1 Gemini Live Voice Integration**
```javascript
// frontend/src/hooks/useGeminiLive.js

const GEMINI_LIVE_URL = 
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent"

// System prompt injected to Gemini Live:
const INTERVIEWER_PROMPT = `
You are Alex, a professional interviewer at a top tech company.
Conduct a ${role} interview for ${candidateName}.

CANDIDATE PROFILE: ${JSON.stringify(profile)}
QUESTION QUEUE: ${JSON.stringify(questions)}

RULES:
- Ask one question at a time. Wait for full answer.
- After each answer, say "I see, thank you" and move to next question.
- If answer is vague, ask ONE follow-up: "Could you elaborate on...?"
- Adapt difficulty: if answer score < 5 (sent via tool call), simplify next question
- Stay professional but warm. Never hint at correct answers.
- Emit JSON tool call after each answer: 
  {signal: "answer_complete", question_id: X, perceived_quality: 1-10}
`

// WebSocket → streams audio bidirectionally
// Gemini speaks questions → candidate answers → STT transcript
```

**3.2 Real-time Scoring Loop**
```python
# Runs async on backend after each answer_complete signal

async def score_answer(question: str, transcript: str, 
                       mediapipe_signals: dict) -> ScoreResult:
    prompt = f"""
    Score this interview answer on 4 axes (0-10 each). JSON only.
    
    Question: {question}
    Answer Transcript: {transcript}
    Body Language Signals: {mediapipe_signals}
    
    Return: {{
      "technical": 0-10,
      "communication": 0-10, 
      "confidence": 0-10,
      "depth": 0-10,
      "filler_word_count": int,
      "key_concepts_mentioned": [str],
      "missed_concepts": [str],
      "one_line_tip": str
    }}
    """
    return await gemini_flash_call(prompt)
```

**3.3 Orchestrator Decision Engine**
```python
# backend/agents/orchestrator.py

class OrchestratorAgent:
    def __init__(self, session: Session):
        self.session = session
        self.scores_history = []
        self.current_difficulty = session.profile.suggested_difficulty
    
    def next_action(self, last_score: ScoreResult) -> OrchestratorAction:
        avg = mean([last_score.technical, last_score.communication])
        
        if avg < 4:
            return OrchestratorAction(
                next_difficulty="easier",
                inject_hint=True,
                encouragement="You're doing great, take your time"
            )
        elif avg > 8:
            return OrchestratorAction(
                next_difficulty="harder",
                inject_hint=False,
                escalate_topic=True
            )
        else:
            return OrchestratorAction(next_difficulty="same")
        
        # Action sent to Gemini Live via tool_result → 
        # Gemini adapts next question dynamically
```

**3.4 MediaPipe Body Language Detection**
```javascript
// frontend/src/hooks/useBodyLanguage.js
// Uses @mediapipe/face_mesh (CDN, free)

const signals = {
  eye_contact_score: 0-10,  // based on gaze direction
  face_visible: boolean,
  expression: "neutral|smile|stressed",
  head_movement: "stable|nodding|looking_away"
}
// Sent to backend every 5 seconds during interview
// Merged into confidence score
```

---

### 🔷 Phase 4 — Feedback & Roadmap (Day 2 · 3 hours)

**4.1 Post-Interview Report Page**

```
┌────────────────────────────────────────┐
│  Session Complete! Great effort ✦      │
│  ─────────────────────────────────    │
│                                        │
│  Overall Score: 7.4 / 10              │
│  ████████░░  Technical: 7.1           │
│  █████████░  Communication: 8.2       │
│  ███████░░░  Confidence: 6.8          │
│  ████████░░  Depth: 7.5               │
│                                        │
│  ── Question Breakdown ──              │
│  Q1: Binary Trees... [8.2] ▼          │
│    "You explained BFS well. Missed    │
│     time complexity mention."          │
│  Q2: System Design... [6.1] ▼         │
│    "Use STAR format next time."        │
│                                        │
│  ── Your 30-Day Roadmap ──            │
│  Week 1: Dynamic Programming (3 Q/day)│
│  Week 2: System Design basics         │
│  Week 3: Communication drills         │
│  Week 4: Mock + Reassess              │
│                                        │
│  [Download PDF]  [Start Next Session] │
└────────────────────────────────────────┘
```

**4.2 Roadmap Agent (POST /api/roadmap/generate)**
```python
async def generate_roadmap(scores: SessionScores, 
                           profile: ResumeProfile) -> Roadmap:
    prompt = f"""
    Student profile: {profile}
    Interview scores: {scores}
    Weak topics: {scores.weak_topics}
    
    Generate a 30-day improvement plan. Return JSON:
    {{
      "critical_gaps": [str, str, str],
      "weeks": [{{
        "week": 1,
        "focus": str,
        "daily_tasks": [str],
        "resources": [{{"title": str, "url": str, "type": "video|article|practice"}}],
        "practice_questions": [str]
      }}],
      "next_session_focus": str
    }}
    """
    # Use Nemotron on OpenRouter — good at structured narrative
    return await openrouter_call("nvidia/nemotron-4-340b-instruct", prompt)
```

---

### 🔷 Phase 5 — Dashboard & Question Bank (Day 2–3 · 2 hours)

**5.1 Progress Dashboard**
- Session history with score trends (Recharts line graph)
- Skill radar chart (Technical · Communication · Confidence · Depth)
- "Practice Again" quick launch per weak topic
- Streak tracker (days practiced)

**5.2 Question Bank Page**
```
Filter by: [All Roles ▼] [Difficulty ▼] [Topic ▼]

┌──────────────────────────────────────────┐
│  Q: Explain the difference between       │
│     process and thread                   │
│  Role: SDE  · Tier: Intermediate         │
│  Topic: OS  · Expected: 3–5 min          │
│  [Practice This →]                       │
└──────────────────────────────────────────┘
```

---

### 🔷 Phase 6 — Deployment (Day 3 · 2 hours)

```
Frontend  → Vercel (free)
           vercel deploy --prod
           
Backend   → Render.com (free tier, 750 hrs/mo)
           Dockerfile → render.yaml

Database  → Supabase (free, 500MB)

Domain    → vercel.app subdomain (free)
```

**Docker for backend:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🆓 Complete Free Stack

| Layer | Tool | Why Free |
|-------|------|----------|
| Voice AI | Gemini 2.5 Pro Live | Free & unlimited currently |
| Evaluator | Gemini 2.0 Flash | Free tier (generous) |
| Questions | MiniMax-2.5 (OpenRouter) | Free on OpenRouter |
| Roadmap | Nemotron 340B (OpenRouter) | Free on OpenRouter |
| Body Language | MediaPipe (browser) | Open source, no server |
| STT | Web Speech API | Browser native, free |
| Database | Supabase | Free 500MB |
| Frontend | Vercel | Free hobby plan |
| Backend | Render.com | Free 750 hrs/mo |
| PDF Parse | PyMuPDF (pymupdf) | Open source |
| Charts | Recharts | Open source |
| UI | Tailwind CSS | Open source |

---

## 🏆 Judge Score Maximization

### Deployment (20 pts)
- ✅ Live URL on day 1 (deploy shell early, fill features)
- ✅ Works on mobile (Softly is mobile-first)
- ✅ Resume upload → interview → feedback full loop

### Agentic AI (20 pts)
- ✅ 5 distinct agents with clear goals
- ✅ Orchestrator makes real-time decisions (not scripted)
- ✅ Difficulty adapts based on scores mid-interview
- ✅ Multi-model pipeline (not one API call)
- **Demo tip:** Show the difficulty escalation live — give a great answer then a bad one

### Placement Impact (15 pts)
- ✅ Show before/after score improvement (seed fake user data)
- ✅ Roadmap tied to real resources (LeetCode, GFG, YouTube)
- ✅ Role-specific question bank (SDE, Data, PM, HR)
- **Stat to quote:** "Students who mock interview 5× are 3× more likely to convert offers"

### Presentation (20 pts)
- ✅ Lead with the pain: "You're nervous. You have no one to practice with."
- ✅ Live demo (have backup recording)
- ✅ Show the Softly UI — it stands out among bland dashboards
- ✅ End with roadmap: "This student went from 5.2 → 8.1 in 2 weeks"

### Innovation (Remaining pts)
- ✅ Body language via MediaPipe (uncommon)
- ✅ Gemini Live voice (real-time, not turn-based)
- ✅ Agentic difficulty adaptation mid-session
- ✅ Softly design (memorable, not generic)

---

## 🗓️ Timeline (3-Day Hackathon)

```
DAY 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hour 0–2:   Phase 0 — Setup, repo, env, Supabase
Hour 2–6:   Phase 1 — Softly UI shell (landing + interview room)
Hour 6–8:   Phase 2 — Resume agent + question pipeline
Hour 8–10:  Phase 3 partial — Gemini Live WebSocket connection
▶ END OF DAY: Landing deployed, resume upload works

DAY 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hour 0–3:   Phase 3 — Complete Orchestrator + scoring loop
Hour 3–5:   Phase 3 — MediaPipe body language
Hour 5–7:   Phase 4 — Post-interview report + roadmap agent
Hour 7–9:   Phase 5 — Dashboard + question bank
▶ END OF DAY: Full interview loop working end-to-end

DAY 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hour 0–2:   Phase 6 — Final deployment + bug fixes
Hour 2–4:   Polish UI, seed demo data, record backup demo
Hour 4–6:   Prepare presentation slides (Softly aesthetic)
Hour 6+:    Practice demo, rehearse pitch
```

---

## ⚠️ Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Gemini Live unstable | Pre-record fallback demo |
| OpenRouter rate limit | Cache generated questions in Supabase |
| MediaPipe slow on mobile | Make it optional, show as "bonus feature" |
| Resume PDF parsing fails | Accept text paste as fallback |
| Render cold start (30s) | Show loading animation, explain in demo |

---

## 🔑 Key Implementation Files

```
Priority Order (build in this sequence):
1. frontend/src/design/tokens.css          ← Softly variables
2. frontend/src/components/GrainOverlay    ← Always visible
3. frontend/src/pages/Landing              ← Judges see this first
4. backend/agents/resume_agent.py          ← Pipeline start
5. backend/agents/orchestrator.py          ← Core agentic logic
6. frontend/src/hooks/useGeminiLive.js     ← The WOW moment
7. backend/agents/evaluator_agent.py       ← Scoring
8. frontend/src/pages/Dashboard            ← Impact evidence
9. backend/agents/roadmap_agent.py         ← Placement impact
10. frontend/src/pages/Report              ← Closing the loop
```

---

*Built for hackathon excellence. Ship early, polish often, demo confidently.*

**InterviewIQ** — *Practice like it's real. Grow like it matters.*
