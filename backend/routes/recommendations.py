"""
AcadMaid Recommendations Route
GET /recommendations  - Get video recommendations based on user preferences

Uses curated mock data (real YouTube video IDs).
To use real YouTube API: replace MOCK_VIDEOS with API calls to
https://www.googleapis.com/youtube/v3/search
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from auth.auth_utils import get_current_user

router = APIRouter()

# ── Mock YouTube Video Database ──────────────────────────────────────────────
# These are real YouTube video IDs — thumbnails/links will work
MOCK_VIDEOS = {
    "Python": {
        "Beginner": [
            {"id": "rfscVS0vtbw", "title": "Python for Beginners – Full Course", "channel": "freeCodeCamp"},
            {"id": "kqtD5dpn9C8", "title": "Python Tutorial for Beginners", "channel": "Programming with Mosh"},
            {"id": "_uQrJ0TkZlc", "title": "Python Tutorial – Python Full Course for Beginners", "channel": "Programming with Mosh"},
            {"id": "eWRfhZUzrAc", "title": "Python Crash Course for Beginners", "channel": "Traversy Media"},
        ],
        "Intermediate": [
            {"id": "HGOBQPFzWKo", "title": "Intermediate Python Programming Course", "channel": "freeCodeCamp"},
            {"id": "Bv25Dwe84g0", "title": "Python OOP – Object Oriented Programming", "channel": "Corey Schafer"},
            {"id": "ZDa-Z5JzLYM", "title": "Python List Comprehensions", "channel": "Corey Schafer"},
            {"id": "daefaLgNkw0", "title": "Python Decorators", "channel": "Corey Schafer"},
        ],
        "Advanced": [
            {"id": "p15xzjzR9j0", "title": "Advanced Python – Iterators, Generators", "channel": "freeCodeCamp"},
            {"id": "jTYiNjvnHZY", "title": "Python Concurrency & Parallelism", "channel": "Tech With Tim"},
            {"id": "NfnMJMkhDoQ", "title": "Python Design Patterns", "channel": "ArjanCodes"},
        ],
    },
    "Web Dev": {
        "Beginner": [
            {"id": "qz0aGYrrlhU", "title": "HTML & CSS Full Course for Beginners", "channel": "freeCodeCamp"},
            {"id": "G3e-cpL7ofc", "title": "HTML & CSS Full Course – Beginner to Pro", "channel": "SuperSimpleDev"},
            {"id": "mU6anWqZJcc", "title": "JavaScript Tutorial for Beginners", "channel": "Programming with Mosh"},
        ],
        "Intermediate": [
            {"id": "w7ejDZ8SWv8", "title": "React JS Full Course", "channel": "Traversy Media"},
            {"id": "bMknfKXIFA8", "title": "React Course – Beginner's Tutorial", "channel": "freeCodeCamp"},
            {"id": "4UZrsTqkcW4", "title": "CSS Flexbox Crash Course", "channel": "Traversy Media"},
        ],
        "Advanced": [
            {"id": "1S8SBDhA7HA", "title": "Next.js 13 Full Course", "channel": "JavaScript Mastery"},
            {"id": "843nec-IvW0", "title": "TypeScript Full Course for Beginners", "channel": "freeCodeCamp"},
            {"id": "82PXenL4MGg", "title": "Node.js & Express – Full Tutorial", "channel": "freeCodeCamp"},
        ],
    },
    "Java": {
        "Beginner": [
            {"id": "eIrMbAQSU34", "title": "Java Tutorial for Beginners", "channel": "Programming with Mosh"},
            {"id": "grEKMHGYyns", "title": "Java Full Course", "channel": "Kunal Kushwaha"},
        ],
        "Intermediate": [
            {"id": "9ueTXG_RnvY", "title": "Java OOP – Full Tutorial", "channel": "Coding with John"},
            {"id": "GhQdlIFylQ8", "title": "Java Collections Framework", "channel": "Coding with John"},
        ],
        "Advanced": [
            {"id": "Ye6OAzdmH5s", "title": "Spring Boot Tutorial", "channel": "Amigoscode"},
            {"id": "qI_g-Q7WHo8", "title": "Java Multithreading & Concurrency", "channel": "freeCodeCamp"},
        ],
    },
    "AI/ML": {
        "Beginner": [
            {"id": "GwIo3gDZCVQ", "title": "Machine Learning Full Course for Beginners", "channel": "freeCodeCamp"},
            {"id": "i_LwzRVP7bg", "title": "Machine Learning with Python", "channel": "freeCodeCamp"},
        ],
        "Intermediate": [
            {"id": "tHL5STNJKag", "title": "TensorFlow 2.0 Complete Course", "channel": "freeCodeCamp"},
            {"id": "aircAruvnKk", "title": "Neural Networks – Deep Learning", "channel": "3Blue1Brown"},
        ],
        "Advanced": [
            {"id": "c36lUUr864M", "title": "Deep Learning Specialization", "channel": "Andrew Ng"},
            {"id": "V_xro1gy8hk", "title": "Transformers – Hugging Face Course", "channel": "Hugging Face"},
        ],
    },
    "Data Science": {
        "Beginner": [
            {"id": "ua-CiDNNj30", "title": "Data Science Full Course for Beginners", "channel": "freeCodeCamp"},
            {"id": "vmEHCJofslg", "title": "Pandas Tutorial", "channel": "Corey Schafer"},
        ],
        "Intermediate": [
            {"id": "ZyhVh-qRZPA", "title": "Data Analysis with Python", "channel": "freeCodeCamp"},
            {"id": "2uvysYbKdjM", "title": "Matplotlib Tutorial", "channel": "Corey Schafer"},
        ],
        "Advanced": [
            {"id": "v5cngxo4mIg", "title": "Statistics for Data Science", "channel": "freeCodeCamp"},
            {"id": "8_bNmSBNDp0", "title": "Advanced SQL for Data Science", "channel": "freeCodeCamp"},
        ],
    },
    "DSA": {
        "Beginner": [
            {"id": "8hly31xKli0", "title": "Data Structures Easy to Advanced", "channel": "freeCodeCamp"},
            {"id": "RBSGKlAvoiM", "title": "Data Structures – CS50", "channel": "CS50"},
        ],
        "Intermediate": [
            {"id": "pkYVOmU3MgA", "title": "Sorting Algorithms Visualized", "channel": "freeCodeCamp"},
            {"id": "09_LlHjoEiY", "title": "Graph Algorithms – BFS & DFS", "channel": "freeCodeCamp"},
        ],
        "Advanced": [
            {"id": "fW2PmMvQSrQ", "title": "Dynamic Programming – Full Course", "channel": "freeCodeCamp"},
            {"id": "A2bems_qAuo", "title": "Advanced Graph Algorithms", "channel": "WilliamFiset"},
        ],
    },
}


@router.get("/")
def get_recommendations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return video recommendations based on user's subject and skill level"""
    prefs = current_user.preferences
    if not prefs:
        return {"videos": [], "message": "Please complete onboarding first"}

    subject = prefs.subject
    level = prefs.skill_level

    # Get videos for subject/level, fall back gracefully
    subject_videos = MOCK_VIDEOS.get(subject, MOCK_VIDEOS.get("Python", {}))
    videos = subject_videos.get(level, subject_videos.get("Beginner", []))

    # Format response with full YouTube URLs
    formatted = []
    for v in videos:
        formatted.append({
            "id": v["id"],
            "title": v["title"],
            "channel": v["channel"],
            "thumbnail": f"https://img.youtube.com/vi/{v['id']}/hqdefault.jpg",
            "url": f"https://www.youtube.com/watch?v={v['id']}",
        })

    return {
        "subject": subject,
        "skill_level": level,
        "videos": formatted
    }