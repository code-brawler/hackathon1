import os
import json
import google.generativeai as genai

class OrchestratorAgent:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        if self.api_key:
            genai.configure(api_key=self.api_key)
        
    def generate_questions(self, config) -> list:
        if not self.api_key:
            return [{"id": 0, "text": "API Key missing! Please configure GEMINI_API_KEY in the backend .env file.", "topic": "Error"}]
        
        # Dynamically map focus onto bounds implicitly, minimum 6, max 12
        prompt = f"""
        You are an expert technical interviewer and HR manager.
        Generate between 6 and 12 interview questions for a {config.role} candidate.
        
        Candidate Context:
        - Experience Level: {config.exp}
        - Tech Stack / Expertise: {config.tech}
        - Interview Focus: {config.focus}
        
        Ensure exactly that the total number of questions is a dynamic minimum of 6 and maximum of 12! Do not generate 5!
        Scale the difficulty precisely to match a {config.exp} tier. Ensure questions strictly align around the {config.focus} focus and utilize concepts relevant to the {config.tech} sector.
        
        The questions must sound conversational, natural, and not robotic.
        Return the result STRICTLY as a JSON array where each object has:
        - "id": an integer counting up starting at 1
        - "text": the actual interview question string
        - "topic": a short string describing the core concept
        Do NOT wrap the response in markdown blocks or any other formatting. Just pure JSON.
        """
        try:
            model = genai.GenerativeModel("gemini-flash-lite-latest", generation_config={"response_mime_type": "application/json"})
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            parsed = json.loads(raw_text)
            # Handle model injecting a {"questions": [...]} wrapper instead of raw array
            if isinstance(parsed, dict) and "questions" in parsed:
                return parsed["questions"]
            return parsed
        except Exception as e:
            print("Error generating questions:", e)
            return [
                {"id": 1, "text": f"Could you tell me about your background and what you're looking for as a {config.role}?", "topic": "Intro"},
                {"id": 2, "text": f"What do you think are the core foundational skills necessary to be successful with {config.tech}?", "topic": "Technical"},
                {"id": 3, "text": "Can you describe a problem you solved recently in your work?", "topic": "Behavioral"},
                {"id": 4, "text": "How do you handle scope creep and changing requirements?", "topic": "Behavioral"},
                {"id": 5, "text": "Describe a scenario where you had to push back on constraints.", "topic": "Leadership"},
                {"id": 6, "text": "Where do you see yourself technically advancing next?", "topic": "Closing"}
            ]

global_orchestrator = OrchestratorAgent()
