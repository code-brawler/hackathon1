import os
import json
import google.generativeai as genai

class EvaluatorAgent:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            
    def evaluate(self, transcript_text: str, question_text: str, target_role: str) -> dict:
        if not self.api_key:
            return {
                "score": 0,
                "feedback": "API Key missing! Please configure GEMINI_API_KEY in the backend .env file.",
                "improvement": "Fix API key immediately to allow evaluation processing."
            }
            
        prompt = f"""
        You are a supportive and expert technical interviewer evaluating a candidate for a {target_role} role.
        The question asked was: "{question_text}"
        The candidate responded: "{transcript_text}"
        
        Evaluate the answer strictly based on its quality, depth, and relevance.
        Return the evaluation STRICTLY as a JSON object with:
        - "score": An integer from 1 to 10
        - "feedback": Exactly 2 clear sentences providing professional feedback.
        - "improvement": Exactly 1 short, actionable tip to improve the answer.
        
        Do NOT wrap the response in markdown blocks or any other formatting. Just pure JSON.
        """
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            # Clean possible markdown block
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            payload = json.loads(raw_text.strip())
            return {
                "score": int(payload.get("score", 5)),
                "feedback": str(payload.get("feedback", "No feedback provided.")),
                "improvement": str(payload.get("improvement", "No specific improvement noted."))
            }
        except Exception as e:
            print("Error evaluating answer:", e)
            return {
                "score": 5, 
                "feedback": f"Error communicating with Gemini: {str(e)[:50]}", 
                "improvement": "Unable to evaluate dynamically."
            }
