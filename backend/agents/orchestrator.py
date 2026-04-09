import os
import json
import google.generativeai as genai

class OrchestratorAgent:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        if self.api_key:
            genai.configure(api_key=self.api_key)
        
    def generate_questions(self, target_role: str) -> list:
        if not self.api_key:
            return [{"id": 0, "text": "API Key missing! Please configure GEMINI_API_KEY in the backend .env file.", "topic": "Error"}]
        
        prompt = f"""
        You are an expert HR and technical interviewer. Generate exactly 5 interview questions for a {target_role} role.
        The questions must sound conversational, natural, and not robotic.
        Return the result STRICTLY as a JSON array where each object has:
        - "id": an integer from 1 to 5
        - "text": the actual interview question string
        - "topic": a short string describing the core concept
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
                
            questions = json.loads(raw_text.strip())
            return questions
        except Exception as e:
            print("Error generating questions:", e)
            return [
                {"id": 1, "text": f"Could you tell me about your background and what you're looking for as a {target_role}?", "topic": "Intro"},
                {"id": 2, "text": "What do you think are the core foundational skills necessary to be successful here?", "topic": "HR"},
                {"id": 3, "text": "Can you describe a simple problem you solved recently in your work?", "topic": "Behavioral"},
                {"id": 4, "text": "How do you handle scope creep and changing requirements?", "topic": "Behavioral"},
                {"id": 5, "text": "Describe a scenario where you had to push back on constraints.", "topic": "Leadership"}
            ]

global_orchestrator = OrchestratorAgent()
