"""
AcadMaid Learning Plan Route
POST /plan  - Generate a structured day-wise learning plan
GET  /plan  - Get the current user's plan
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth.auth_utils import get_current_user

router = APIRouter()


class PlanRequest(BaseModel):
    hours_per_day: float    # e.g., 2.0
    num_days: int           # e.g., 30


# ── Curriculum Templates ─────────────────────────────────────────────────────
CURRICULUM = {
    "Python": {
        "Beginner": [
            "Introduction to Python & Setup",
            "Variables, Data Types & Input",
            "Operators & Expressions",
            "Conditional Statements (if/else)",
            "Loops – for & while",
            "Functions & Scope",
            "Lists & Tuples",
            "Dictionaries & Sets",
            "String Methods",
            "File Handling",
            "Error Handling (try/except)",
            "Modules & pip",
            "Mini Project: Calculator App",
            "Mini Project: To-Do List",
            "Review & Assessment",
        ],
        "Intermediate": [
            "Object-Oriented Programming",
            "Classes & Objects",
            "Inheritance & Polymorphism",
            "Decorators",
            "Generators & Iterators",
            "List Comprehensions",
            "Lambda & Higher-Order Functions",
            "Regular Expressions",
            "Working with APIs (requests)",
            "JSON Handling",
            "Virtual Environments",
            "Testing with pytest",
            "Project: REST API client",
            "Project: Data parser",
            "Review & Assessment",
        ],
        "Advanced": [
            "Async Programming (asyncio)",
            "Concurrency & Threading",
            "Metaclasses",
            "Design Patterns in Python",
            "Performance Optimization",
            "Memory Management",
            "C Extensions",
            "Building CLI tools (Click)",
            "Package publishing (PyPI)",
            "Project: Full async application",
        ],
    },
    "Web Dev": {
        "Beginner": [
            "HTML Basics – Structure & Tags",
            "HTML Forms & Tables",
            "CSS Basics – Selectors & Properties",
            "CSS Box Model",
            "Flexbox Layout",
            "CSS Grid",
            "Responsive Design",
            "JavaScript Basics",
            "DOM Manipulation",
            "Events & Event Listeners",
            "Fetch API",
            "Project: Personal Portfolio",
            "Project: Landing Page",
            "Version Control with Git",
            "Review & Assessment",
        ],
        "Intermediate": [
            "ES6+ Features",
            "React.js Introduction",
            "React Components & Props",
            "State & Lifecycle",
            "React Hooks",
            "React Router",
            "Axios & API Integration",
            "CSS Frameworks (Tailwind)",
            "State Management (Context API)",
            "Project: React Dashboard",
        ],
        "Advanced": [
            "Next.js & SSR",
            "TypeScript",
            "Testing (Jest, RTL)",
            "Performance & Optimization",
            "CI/CD Pipelines",
            "Docker for Frontend",
            "Project: Full-stack App",
        ],
    },
    "AI/ML": {
        "Beginner": [
            "Math for ML – Linear Algebra",
            "Math for ML – Statistics & Probability",
            "Python for Data Science",
            "NumPy Basics",
            "Pandas Basics",
            "Data Visualization (Matplotlib)",
            "Introduction to Machine Learning",
            "Supervised Learning – Regression",
            "Supervised Learning – Classification",
            "Model Evaluation",
            "Unsupervised Learning",
            "scikit-learn",
            "Project: Iris Classification",
            "Project: House Price Prediction",
            "Review & Assessment",
        ],
        "Intermediate": [
            "Neural Networks from Scratch",
            "Introduction to Deep Learning",
            "TensorFlow & Keras",
            "CNNs for Image Recognition",
            "RNNs & LSTMs",
            "Transfer Learning",
            "Natural Language Processing Basics",
            "Project: Image Classifier",
            "Project: Sentiment Analysis",
        ],
        "Advanced": [
            "Transformers & Attention",
            "Large Language Models",
            "Reinforcement Learning",
            "MLOps & Model Deployment",
            "Research Paper Implementation",
        ],
    },
}

# Default curriculum for unlisted subjects
DEFAULT_TOPICS = [
    "Introduction & Setup",
    "Core Concepts – Part 1",
    "Core Concepts – Part 2",
    "Hands-on Practice",
    "Intermediate Topics",
    "Project Work",
    "Advanced Topics",
    "Best Practices",
    "Real-world Applications",
    "Review & Next Steps",
]


def generate_plan(subject: str, level: str, hours_per_day: float, num_days: int) -> list:
    """
    Distribute topics across the given number of days.
    Multiple easy topics may fit in one day; hard topics may span multiple days.
    """
    # Get topic list for subject/level
    subject_curriculum = CURRICULUM.get(subject, {})
    topics = subject_curriculum.get(level, DEFAULT_TOPICS)

    plan = []
    # Distribute topics proportionally across days
    topics_per_day = max(1, round(len(topics) / num_days * 1.5))

    topic_index = 0
    for day in range(1, num_days + 1):
        day_topics = []
        # How many topics fit today based on hours
        slots = max(1, int(hours_per_day))

        for _ in range(min(slots, topics_per_day)):
            if topic_index < len(topics):
                day_topics.append(topics[topic_index])
                topic_index += 1

        if not day_topics and topic_index >= len(topics):
            day_topics = ["Review & Practice", "Build on previous concepts"]

        plan.append({
            "day": day,
            "topics": day_topics,
            "hours": hours_per_day,
            "completed": False
        })

    return plan


@router.post("/")
def create_plan(
    request: PlanRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and return a day-wise learning plan"""
    prefs = current_user.preferences
    if not prefs:
        raise HTTPException(status_code=400, detail="Set your preferences before generating a plan")

    # Save plan params to preferences
    prefs.hours_per_day = request.hours_per_day
    prefs.num_days = request.num_days
    db.commit()

    plan = generate_plan(
        subject=prefs.subject,
        level=prefs.skill_level,
        hours_per_day=request.hours_per_day,
        num_days=request.num_days
    )

    return {
        "subject": prefs.subject,
        "skill_level": prefs.skill_level,
        "hours_per_day": request.hours_per_day,
        "num_days": request.num_days,
        "total_topics": sum(len(d["topics"]) for d in plan),
        "plan": plan
    }


@router.get("/")
def get_plan(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate the plan from saved preferences"""
    prefs = current_user.preferences
    if not prefs or not prefs.hours_per_day or not prefs.num_days:
        raise HTTPException(status_code=404, detail="No plan found. Please generate one first.")

    plan = generate_plan(
        subject=prefs.subject,
        level=prefs.skill_level,
        hours_per_day=prefs.hours_per_day,
        num_days=prefs.num_days
    )

    return {
        "subject": prefs.subject,
        "skill_level": prefs.skill_level,
        "hours_per_day": prefs.hours_per_day,
        "num_days": prefs.num_days,
        "total_topics": sum(len(d["topics"]) for d in plan),
        "plan": plan
    }