import logging
import base64
import speech_recognition as sr
from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import urllib.request
import urllib.parse

from agents.evaluator_agent import EvaluatorAgent
from agents.orchestrator import global_orchestrator

app = FastAPI(title="InterviewIQ Backend (Local AI)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

evaluator = EvaluatorAgent()
logger = logging.getLogger("uvicorn.error")

class InterviewAnswer(BaseModel):
    question_id: int
    transcript: str
    confidence_score: float
    target_role: str = "Software Engineering"

class RoleConfig(BaseModel):
    role: str

@app.post("/api/interview/evaluate")
async def evaluate_answer(payload: InterviewAnswer):
    logger.info(f"Evaluating QID {payload.question_id}: '{payload.transcript}'")
    
    # 1. Evaluate the transcript
    scores = evaluator.evaluate(payload.transcript, payload.question_id, payload.confidence_score)
    logger.info(f"Generated Scores: {scores}")
    
    # 2. Orchestrator decides next question based on scores & role
    next_question = global_orchestrator.get_next_question(scores, payload.target_role)
    
    return {
        "scores": scores,
        "next_question": next_question
    }

class STTPayload(BaseModel):
    audio_base64: str

@app.post("/api/stt")
async def process_speech_to_text(payload: STTPayload = Body(...)):
    try:
        import io
        raw_wav_bytes = base64.b64decode(payload.audio_base64)
        
        recognizer = sr.Recognizer()
        with sr.AudioFile(io.BytesIO(raw_wav_bytes)) as source:
            audio_data = recognizer.record(source)
            
        transcript = recognizer.recognize_google(audio_data)
        
        return {"transcript": transcript}
    except sr.UnknownValueError:
        return {"transcript": ""}
    except sr.RequestError as e:
        logger.error(f"Google API request error: {e}")
        return {"transcript": ""}
    except Exception as e:
        logger.error(f"STT Error: {e}")
        return {"transcript": ""}

@app.get("/api/tts")
async def text_to_speech(text: str):
    try:
        encoded_text = urllib.parse.quote(text[:300])
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded_text}&tl=en&client=tw-ob"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req) as response:
            audio_data = response.read()
        return Response(content=audio_data, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS Error: {e}")
        return Response(content=b"", status_code=500)

# Keeping previous mocked endpoints for UI completeness
@app.post("/api/resume/parse")
async def parse_resume(file: UploadFile = File(...), target_role: str = Form(...)):
    return {
        "name": "Candidate", "experience_years": 2, "role": target_role,
        "skills": [{"name": "React", "confidence": 7}],
        "weak_areas": [], "suggested_difficulty": "intermediate"
    }

@app.post("/api/questions/generate")
async def generate_questions(config: RoleConfig):
    return {"questions": global_orchestrator.question_bank["intermediate"]}

@app.post("/api/roadmap/generate")
async def generate_roadmap():
    return {
        "critical_gaps": ["Pacing", "Targeted Keyword Usage"],
        "weeks": [{"week": 1, "focus": "System Design Basics", "daily_tasks": ["Draw architecture block diagrams"], "resources": []}]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
