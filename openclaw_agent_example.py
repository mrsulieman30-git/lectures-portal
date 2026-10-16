"""
OpenClaw / Telegram Agent Client for Lecture Portal
----------------------------------------------------
This script demonstrates how OpenClaw (or any autonomous agent / Telegram bot)
connects to your Lecture Portal using username & password, fetches student
submissions, performs OCR on handwriting images and AI-generation checks, and
proposes grades into the "Human-in-the-Loop" Permission Queue.
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

class LecturePortalAgent:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.token = None
        self.agent_info = None

    def login(self, email, password):
        """Authenticate using username (email) and password to get a Bearer token."""
        url = f"{self.base_url}/agent/login"
        payload = {
            "email": email,
            "password": password,
            "device_name": "OpenClaw-Worker-1"
        }
        res = requests.post(url, json=payload, headers={"Accept": "application/json"})
        if res.status_code == 200:
            data = res.json()
            self.token = data["token"]
            self.agent_info = data["agent"]
            print(f"[+] Logged in as: {self.agent_info['name']} ({self.agent_info['role']})")
            return self.token
        else:
            raise Exception(f"Login failed [{res.status_code}]: {res.text}")

    @property
    def headers(self):
        return {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

    def get_pending_submissions(self):
        """Fetch all student submissions waiting for grading."""
        url = f"{self.base_url}/agent/submissions/pending"
        res = requests.get(url, headers=self.headers)
        res.raise_for_status()
        return res.json()["submissions"]

    def propose_grade(self, submission_id, grade, feedback, ocr_text=None, ai_probability=None, reasoning=None):
        """
        Submit review & grading recommendation.
        ALWAYS queues for professor permission before anything is applied to the student's grade.
        """
        url = f"{self.base_url}/agent/submissions/{submission_id}/propose-grade"
        payload = {
            "grade": grade,
            "feedback": feedback,
            "ocr_text": ocr_text,
            "ai_probability": ai_probability,
            "ai_verdict": "Human Written" if (ai_probability is not None and ai_probability < 50) else "Likely AI Generated",
            "reasoning": reasoning or "Automated evaluation against rubric"
        }
        res = requests.post(url, json=payload, headers=self.headers)
        res.raise_for_status()
        data = res.json()
        print(f"[+] Action #{data['action_id']} Queued. Status: {data['status']}")
        return data

    def check_action_status(self, action_id):
        """Check if the professor has approved or rejected the proposal."""
        url = f"{self.base_url}/agent/actions/{action_id}"
        res = requests.get(url, headers=self.headers)
        res.raise_for_status()
        return res.json()

    def approve_action_via_telegram(self, action_id):
        """
        Can be called directly from your Telegram bot webhook when the professor
        taps the 'Approve' inline button in Telegram!
        """
        url = f"{self.base_url}/agent/actions/{action_id}/approve"
        res = requests.post(url, headers=self.headers)
        res.raise_for_status()
        return res.json()


if __name__ == "__main__":
    agent = LecturePortalAgent()
    
    # 1. Login with your instructor or agent account:
    # agent.login("instructor@portal.com", "your-password")

    # 2. Fetch pending student submissions:
    # submissions = agent.get_pending_submissions()
    # print(f"Found {len(submissions)} submissions needing review.")

    # 3. Simulate processing a handwritten submission:
    # for sub in submissions:
    #     file_url = sub.get("file_url")
    #     print(f"Inspecting file: {file_url}")
    #     # -> OpenClaw downloads file, runs OCR & AI detection:
    #     ocr_result = "Question 1: Derivation of f'(x)..."
    #     ai_score = 6.2  # 6.2% AI probability (human written)
    #
    #     # Propose grade (Human-In-The-Loop approval):
    #     agent.propose_grade(
    #         submission_id=sub["id"],
    #         grade=92,
    #         feedback="Great handwritten derivations. Question 3 step 2 has a minor sign error.",
    #         ocr_text=ocr_result,
    #         ai_probability=ai_score,
    #         reasoning="Correct formula application; clean handwritten work."
    #     )
