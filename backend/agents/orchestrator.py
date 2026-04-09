class OrchestratorAgent:
    def __init__(self):
        self.question_bank = {
            "beginner": [
                {"id": 0, "text": "To start off, could you tell me about your background and what you're looking for as a [ROLE]?", "topic": "HR"},
                {"id": 10, "text": "What do you think are the core foundational skills necessary to be a successful [ROLE]?", "topic": "HR"},
                {"id": 11, "text": "Can you describe a simple problem you solved recently in your work?", "topic": "Behavioral"}
            ],
            "intermediate": [
                {"id": 1, "text": "Could you walk me through a time when you had to optimize a system or workflow in your capacity as a [ROLE]?", "topic": "System Design"},
                {"id": 2, "text": "How do you handle scope creep and changing requirements in the middle of a project?", "topic": "Behavioral"},
                {"id": 12, "text": "How do you handle a critical incident when the system or project is failing?", "topic": "Behavioral"}
            ],
            "advanced": [
                {"id": 20, "text": "Explain how you would design or structure a large-scale project across multiple functional teams as a senior [ROLE].", "topic": "System Architecture"},
                {"id": 21, "text": "Describe a scenario where you had to push back on leadership because of technical or strategic constraints.", "topic": "Leadership"}
            ]
        }
        
        # State tracking
        self.current_tier = "intermediate"
        self.asked_ids = set([0]) # Assuming 0 is asked first
        
    def get_next_question(self, last_scores: dict, target_role: str = "Software Engineering") -> dict:
        avg = (last_scores["technical"] + last_scores["communication"]) / 2
        
        # Adjust difficulty
        if avg < 4.5:
            self.current_tier = "beginner"
        elif avg > 8.0:
            if self.current_tier == "beginner":
                self.current_tier = "intermediate"
            else:
                self.current_tier = "advanced"
                
        # Force terminate after 5 questions
        if len(self.asked_ids) >= 5:
            # Send the ending signal
            next_q = {"id": 99, "text": "We're out of time. Thank you for your time today. Let's head over to the dashboard to see your results.", "topic": "Closing"}
            self.asked_ids.add(99)
            return next_q

        # Pick Question
        available = [q for q in self.question_bank[self.current_tier] if q["id"] not in self.asked_ids and q["id"] != 99]
        
        if not available:
            available = [q for q in self.question_bank["intermediate"] if q["id"] not in self.asked_ids and q["id"] != 99]
            
        if not available:
            return {"id": 99, "text": "We're out of time. Thank you for your time today.", "topic": "Closing"}
            
        next_q = available[0]
        self.asked_ids.add(next_q["id"])
        
        # Add verbal encouragement if score was poor
        text = next_q["text"]
        if avg < 5.0 and len(self.asked_ids) < 4:
            text = "No worries, let's switch gears. " + text
            
        # Parse template
        text = text.replace("[ROLE]", target_role)
            
        return {"id": next_q["id"], "text": text, "topic": next_q["topic"]}

# Global instance for singleton state across endpoints
global_orchestrator = OrchestratorAgent()
