import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables including GEMINI_API_KEY
load_dotenv()

from agents.evaluator_agent import EvaluatorAgent
from agents.orchestrator import global_orchestrator
from agents.behavior_agent import global_behavior_agent

app = FastAPI(title="InterviewIQ Backend (Native AI Edition)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

evaluator = EvaluatorAgent()
logger = logging.getLogger("uvicorn.error")

class RoleConfig(BaseModel):
    role: str
    exp: str = "Mid-Level"
    tech: str = "General"
    focus: str = "Mixed"

class InterviewAnswer(BaseModel):
    question_text: str
    transcript: str
    target_role: str = "Software Engineering"
    exp: str = "Mid-Level"
    tech: str = "General"
    focus: str = "Mixed"

class BehaviorPayload(BaseModel):
    motion_flags: int
    multi_face_flags: int
    confidence: float

class TranscriptItem(BaseModel):
    q: str
    a: str
    score: int

class SummaryPayload(BaseModel):
    history: list[TranscriptItem]
    role: str
    exp: str

class STTPayload(BaseModel):
    audio_base64: str

@app.post("/api/stt")
async def process_speech_to_text(payload: STTPayload = Body(...)):
    try:
        import io
        import base64
        import speech_recognition as sr
        raw_wav_bytes = base64.b64decode(payload.audio_base64)
        
        recognizer = sr.Recognizer()
        with sr.AudioFile(io.BytesIO(raw_wav_bytes)) as source:
            audio_data = recognizer.record(source)
            
        transcript = recognizer.recognize_google(audio_data)
        return {"transcript": transcript}
    except Exception as e:
        return {"transcript": ""}

@app.post("/api/questions/generate")
async def generate_questions(config: RoleConfig):
    questions = global_orchestrator.generate_questions(config)
    return {"questions": questions}

@app.post("/api/interview/evaluate")
async def evaluate_answer(payload: InterviewAnswer):
    scores = evaluator.evaluate(
        payload.transcript, 
        payload.question_text, 
        payload.target_role,
        payload.exp,
        payload.tech,
        payload.focus
    )
    return scores

@app.post("/api/resume/parse")
async def parse_resume(file: UploadFile = File(...), target_role: str = Form(...)):
    return {
        "name": "Candidate", "experience_years": 2, "role": target_role,
        "skills": [{"name": "React", "confidence": 7}],
        "weak_areas": [], "suggested_difficulty": "intermediate"
    }

@app.post("/api/interview/behavior")
async def analyze_behavior(payload: BehaviorPayload):
    analysis = global_behavior_agent.analyze(payload.motion_flags, payload.multi_face_flags, payload.confidence)
    return analysis

@app.post("/api/interview/summary")
async def generate_interview_summary(payload: SummaryPayload):
    history_dicts = [{"q": i.q, "a": i.a, "score": i.score} for i in payload.history]
    analysis = evaluator.generate_summary(history_dicts, payload.role, payload.exp)
    return analysis

@app.post("/api/roadmap/generate")
async def generate_roadmap():
    return {
        "critical_gaps": ["Pacing", "Targeted Keyword Usage"],
        "weeks": [{"week": 1, "focus": "System Design Basics", "daily_tasks": ["Draw architecture block diagrams"], "resources": []}]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
