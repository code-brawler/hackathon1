import os
import json
import google.generativeai as genai

class BehaviorAgent:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            
    def analyze(self, motion_flags: int, multi_face_flags: int, confidence: float) -> dict:
        if not self.api_key:
            return {
                "summary": "You demonstrated acceptable physical discipline.",
                "dos": ["Maintain central gaze naturally.", "Keep external noise completely minimum."],
                "donts": ["Do not let strangers physically enter the frame.", "Do not shift rapidly or twitch aggressively."]
            }
            
        prompt = f"""
        You are an elite Recruiter/HR Agent grading a candidate's physical demeanor during an interview.
        Telemetry Data from Computer Vision Engine:
        - Excessive Movement Violations: {motion_flags}
        - Multiple People in Frame Violations: {multi_face_flags}
        - AI Core Confidence Model Score: {confidence}/10.0
        
        Provide professional, sharp physical feedback on their behavioral posture. If they moved too much, warn them brutally about seeming distracted/anxious. If multiple people appeared, strictly warn them about confidentiality and securing a private space. If they were perfect (0 violations), praise their stillness and professionalism.
        
        Return STRICTLY JSON:
        - "summary": A 2-sentence summary giving severe critique of their physical presence.
        - "dos": An array of exactly 2 actionable physical instructions (strings) on what to do next time physically.
        - "donts": An array of exactly 2 actionable physical instructions (strings) on what NOT to do next time physically.
        """
        try:
            model = genai.GenerativeModel("gemini-flash-lite-latest", generation_config={"response_mime_type": "application/json"})
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            return json.loads(raw_text)
        except Exception as e:
            print("Error parsing behavior:", e)
            return {
                "summary": "Mock Analytics: You maintained robust physical contact and composure throughout.",
                "dos": ["Sit firmly with minor natural periodic adjustment.", "Ensure your background remains totally physically cleared."],
                "donts": ["Avoid erratic head twisting mapping to anxiety markers negatively.", "Never let secondary individuals physically bleed into visual recording ranges."]
            }

global_behavior_agent = BehaviorAgent()
