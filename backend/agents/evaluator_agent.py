class EvaluatorAgent:
    def __init__(self):
        # Basic expected keywords for tracking topics (Mock)
        self.knowledge_base = {
            "0": ["react", "python", "backend", "frontend", "scaling", "fastapi", "experience", "learning"],
            "1": ["cache", "redis", "database", "index", "sharding", "bottleneck", "latency", "load balancer"],
            "2": ["memory", "thread", "concurrency", "deadlock", "process", "context switch", "mutex"],
        }
    
    def evaluate(self, transcript_text: str, question_id: int, confidence_proxy: float) -> dict:
        text = transcript_text.lower()
        words = text.split()
        word_count = len(words)
        
        # 1. Communication Score based roughly on length (STAR method proxy)
        if word_count < 10:
            comm_score = 3.0
        elif 10 <= word_count < 40:
            comm_score = 6.0
        elif 40 <= word_count < 120:
            comm_score = 9.0
        else:
            comm_score = 7.0 # Too rambly
            
        # 2. Technical Score based on keyword matching
        expected_keywords = self.knowledge_base.get(str(question_id), ["system", "data", "optimize", "time", "space", "complexity"])
        matched = [kw for kw in expected_keywords if kw in text]
        
        if len(expected_keywords) > 0:
            match_ratio = len(matched) / len(expected_keywords)
        else:
            match_ratio = 1.0
            
        tech_score = 3.0 + (match_ratio * 7.0)
        if word_count < 5:
            tech_score = 2.0 # Can't be historically accurate with 3 words
            
        # 3. Depth (Combination)
        depth_score = (tech_score * 0.6) + (comm_score * 0.4)
        final_score = round(depth_score, 1)

        # 4. Generate Feedback UI Strings
        if final_score >= 8.0:
            feedback = "Great answer! You clearly demonstrated a strong grasp of the required technical concepts."
            improvement = "Try applying this logic to an even larger, more complex scale scenario."
        elif final_score >= 5.0:
            feedback = "Good attempt, highlighting some of the key technical components."
            improvement = "Increase depth by dropping in some key technical vocabulary like the ones evaluated."
        else:
            feedback = "The answer lacked technical depth or length for this question."
            improvement = "Review the core concepts around this topic and practice expanding your explanations using the STAR method."

        return {
            "technical": round(tech_score, 1),
            "communication": round(comm_score, 1),
            "confidence": round(confidence_proxy, 1),
            "depth": final_score,
            "feedback": feedback,
            "improvement": improvement,
            "matched_keywords": matched
        }
