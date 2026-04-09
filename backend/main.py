import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env variables including GEMINI_API_KEY
load_dotenv()

from agents.evaluator_agent import EvaluatorAgent
from agents.orchestrator import global_orchestrator

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

class InterviewAnswer(BaseModel):
    question_text: str
    transcript: str
    target_role: str = "Software Engineering"

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
    questions = global_orchestrator.generate_questions(config.role)
    return {"questions": questions}

@app.post("/api/interview/evaluate")
async def evaluate_answer(payload: InterviewAnswer):
    scores = evaluator.evaluate(payload.transcript, payload.question_text, payload.target_role)
    return scores

@app.post("/api/resume/parse")
async def parse_resume(file: UploadFile = File(...), target_role: str = Form(...)):
    return {
        "name": "Candidate", "experience_years": 2, "role": target_role,
        "skills": [{"name": "React", "confidence": 7}],
        "weak_areas": [], "suggested_difficulty": "intermediate"
    }

@app.post("/api/roadmap/generate")
async def generate_roadmap():
    return {
        "critical_gaps": ["Pacing", "Targeted Keyword Usage"],
        "weeks": [{"week": 1, "focus": "System Design Basics", "daily_tasks": ["Draw architecture block diagrams"], "resources": []}]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
