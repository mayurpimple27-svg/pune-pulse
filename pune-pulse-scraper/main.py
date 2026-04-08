"""
Pune Pulse News Scraper — FastAPI service that scrapes Pune news from
Google News RSS, Times of India RSS, and Hindustan Times RSS feeds.
Exposes /news and /traffic endpoints consumed by the Spring Boot backend.
"""

import asyncio
import logging
import os
import re
from datetime import datetime, timezone
from typing import Optional
from contextlib import asynccontextmanager

import feedparser
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_csv(name: str, default: str) -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


APP_TITLE = os.getenv("SCRAPER_APP_TITLE", "Pune Pulse Scraper")
APP_VERSION = os.getenv("SCRAPER_APP_VERSION", "1.0.0")
LOG_LEVEL = os.getenv("SCRAPER_LOG_LEVEL", "INFO").upper()
HOST = os.getenv("SCRAPER_HOST", "0.0.0.0")
PORT = _env_int("SCRAPER_PORT", 8000)
RELOAD = _env_bool("SCRAPER_RELOAD", True)
REFRESH_MINUTES = _env_int("SCRAPER_REFRESH_MINUTES", 15)
FEED_ENTRY_LIMIT = _env_int("SCRAPER_FEED_ENTRY_LIMIT", 15)
NEWS_CACHE_LIMIT = _env_int("SCRAPER_NEWS_CACHE_LIMIT", 50)
HTTP_TIMEOUT_SECONDS = float(os.getenv("SCRAPER_HTTP_TIMEOUT_SECONDS", "15"))
USER_AGENT = os.getenv("SCRAPER_USER_AGENT", "PunePulse/1.0 NewsAggregator")
CORS_ORIGINS = _env_csv("SCRAPER_CORS_ORIGINS", "http://localhost:5173,http://localhost:8090")

logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))
logger = logging.getLogger("pune-scraper")

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class NewsArticle(BaseModel):
    title: str
    summary: str
    source: str
    url: str
    published: str
    category: str  # TRAFFIC | POWER | WATER | EVENT | GENERAL
    area: Optional[str] = None


class TrafficHotspot(BaseModel):
    area: str
    lat: float
    lng: float
    severity: str  # LOW | MEDIUM | HIGH
    description: str
    updated: str


# ---------------------------------------------------------------------------
# In-memory store (refreshed every 15 minutes)
# ---------------------------------------------------------------------------

news_cache: list[NewsArticle] = []
traffic_cache: list[TrafficHotspot] = []

# ---------------------------------------------------------------------------
# Pune areas with lat/lng for map
# ---------------------------------------------------------------------------

PUNE_AREAS = {
    "Hinjewadi": (18.5912, 73.7388),
    "Kothrud": (18.5074, 73.8077),
    "Baner": (18.5590, 73.7868),
    "Viman Nagar": (18.5679, 73.9143),
    "Hadapsar": (18.5089, 73.9260),
    "Koregaon Park": (18.5362, 73.8939),
    "Shivajinagar": (18.5308, 73.8474),
    "Deccan": (18.5195, 73.8403),
    "Aundh": (18.5580, 73.8077),
    "Wakad": (18.5981, 73.7607),
    "Pimpri": (18.6298, 73.7997),
    "Chinchwad": (18.6298, 73.7919),
    "Katraj": (18.4575, 73.8650),
    "Swargate": (18.5018, 73.8636),
    "Magarpatta": (18.5156, 73.9269),
    "Kalyani Nagar": (18.5463, 73.9020),
    "Camp": (18.5148, 73.8788),
    "Bibwewadi": (18.4812, 73.8671),
    "Warje": (18.4878, 73.7958),
    "Karve Nagar": (18.4985, 73.8148),
    "Pune-Mumbai Expressway": (18.6500, 73.6800),
    "Hinjewadi IT Park": (18.5870, 73.7390),
    "Sinhagad Road": (18.4800, 73.8200),
    "FC Road": (18.5230, 73.8410),
    "MG Road": (18.5170, 73.8780),
    "JM Road": (18.5200, 73.8400),
    "University Road": (18.5250, 73.8300),
}

# Keywords for category detection
TRAFFIC_KEYWORDS = ["traffic", "road", "jam", "accident", "congestion", "signal", "highway",
                     "expressway", "metro", "bus", "commute", "diversion", "closure"]
POWER_KEYWORDS = ["power", "electricity", "load shedding", "outage", "blackout", "msedcl",
                   "transformer", "voltage"]
WATER_KEYWORDS = ["water", "supply", "pipeline", "tanker", "dam", "khadakwasla",
                   "contamination", "borewell"]
EVENT_KEYWORDS = ["event", "festival", "ganesh", "diwali", "rally", "marathon", "concert",
                  "exhibition", "ceremony", "inauguration", "cricket", "match"]


def classify_article(title: str, summary: str) -> str:
    text = (title + " " + summary).lower()
    if any(k in text for k in TRAFFIC_KEYWORDS):
        return "TRAFFIC"
    if any(k in text for k in POWER_KEYWORDS):
        return "POWER"
    if any(k in text for k in WATER_KEYWORDS):
        return "WATER"
    if any(k in text for k in EVENT_KEYWORDS):
        return "EVENT"
    return "GENERAL"


def detect_area(text: str) -> Optional[str]:
    text_lower = text.lower()
    for area in PUNE_AREAS:
        if area.lower() in text_lower:
            return area
    return None


# ---------------------------------------------------------------------------
# RSS feed scraping
# ---------------------------------------------------------------------------

RSS_FEEDS = [
    ("Google News - Pune", "https://news.google.com/rss/search?q=Pune+city&hl=en-IN&gl=IN&ceid=IN:en"),
    ("Google News - Pune Traffic", "https://news.google.com/rss/search?q=Pune+traffic&hl=en-IN&gl=IN&ceid=IN:en"),
    ("Google News - Pune Weather", "https://news.google.com/rss/search?q=Pune+weather&hl=en-IN&gl=IN&ceid=IN:en"),
    ("Google News - PMC Pune", "https://news.google.com/rss/search?q=PMC+Pune&hl=en-IN&gl=IN&ceid=IN:en"),
    ("Google News - Pune Events", "https://news.google.com/rss/search?q=Pune+events&hl=en-IN&gl=IN&ceid=IN:en"),
    ("TOI Pune", "https://timesofindia.indiatimes.com/rssfeeds/4574144.cms"),
]


async def fetch_rss_feed(client: httpx.AsyncClient, name: str, url: str) -> list[NewsArticle]:
    articles = []
    try:
        response = await client.get(url, timeout=HTTP_TIMEOUT_SECONDS)
        feed = feedparser.parse(response.text)

        for entry in feed.entries[:FEED_ENTRY_LIMIT]:
            title = BeautifulSoup(entry.get("title", ""), "html.parser").get_text()
            raw_summary = entry.get("summary", entry.get("description", ""))
            summary = BeautifulSoup(raw_summary, "html.parser").get_text()[:500]

            # Only keep Pune-related articles
            combined = (title + " " + summary).lower()
            if "pune" not in combined and not detect_area(title + " " + summary):
                continue

            published = entry.get("published", "")
            link = entry.get("link", "")

            category = classify_article(title, summary)
            area = detect_area(title + " " + summary)

            articles.append(NewsArticle(
                title=title.strip(),
                summary=summary.strip(),
                source=name,
                url=link,
                published=published or datetime.now(timezone.utc).isoformat(),
                category=category,
                area=area,
            ))
    except Exception as e:
        logger.error(f"Failed to fetch {name}: {e}")
    return articles


async def scrape_all_news():
    global news_cache, traffic_cache
    logger.info("Starting news scrape cycle...")

    all_articles: list[NewsArticle] = []
    async with httpx.AsyncClient(
        headers={"User-Agent": USER_AGENT},
        follow_redirects=True
    ) as client:
        tasks = [fetch_rss_feed(client, name, url) for name, url in RSS_FEEDS]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for result in results:
            if isinstance(result, list):
                all_articles.extend(result)

    # Deduplicate by title similarity
    seen_titles: set[str] = set()
    unique: list[NewsArticle] = []
    for article in all_articles:
        normalized = re.sub(r"\s+", " ", article.title.lower().strip())
        if normalized not in seen_titles:
            seen_titles.add(normalized)
            unique.append(article)

    news_cache = unique[:NEWS_CACHE_LIMIT]
    logger.info(f"Scraped {len(news_cache)} unique Pune news articles")

    # Build traffic hotspots from TRAFFIC-category news
    traffic_articles = [a for a in news_cache if a.category == "TRAFFIC"]
    hotspots: list[TrafficHotspot] = []
    seen_areas: set[str] = set()
    for article in traffic_articles:
        area = article.area
        if area and area in PUNE_AREAS and area not in seen_areas:
            seen_areas.add(area)
            lat, lng = PUNE_AREAS[area]
            desc_lower = (article.title + " " + article.summary).lower()
            severity = "HIGH" if any(w in desc_lower for w in ["accident", "closure", "blocked", "jam"]) \
                else "MEDIUM" if any(w in desc_lower for w in ["congestion", "delay", "slow"]) \
                else "LOW"
            hotspots.append(TrafficHotspot(
                area=area, lat=lat, lng=lng, severity=severity,
                description=article.title,
                updated=datetime.now(timezone.utc).isoformat(),
            ))

    # Add some well-known congestion points
    default_hotspots = [
        ("Hinjewadi IT Park", "HIGH", "Regular peak-hour congestion on Hinjewadi-Wakad corridor"),
        ("Swargate", "MEDIUM", "Bus terminal area — moderate congestion during peak hours"),
        ("Pune-Mumbai Expressway", "MEDIUM", "Variable traffic flow on expressway stretch"),
    ]
    for area_name, sev, desc in default_hotspots:
        if area_name not in seen_areas and area_name in PUNE_AREAS:
            lat, lng = PUNE_AREAS[area_name]
            hotspots.append(TrafficHotspot(
                area=area_name, lat=lat, lng=lng, severity=sev,
                description=desc,
                updated=datetime.now(timezone.utc).isoformat(),
            ))

    traffic_cache = hotspots
    logger.info(f"Identified {len(traffic_cache)} traffic hotspots")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Scrape on startup
    await scrape_all_news()
    # Schedule periodic scraping
    scheduler = AsyncIOScheduler()
    scheduler.add_job(scrape_all_news, "interval", minutes=REFRESH_MINUTES)
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title=APP_TITLE, version=APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/news", response_model=list[NewsArticle])
async def get_news(
    category: Optional[str] = Query(None, description="Filter by TRAFFIC|POWER|WATER|EVENT|GENERAL"),
    limit: int = Query(20, ge=1, le=50),
):
    articles = news_cache
    if category:
        articles = [a for a in articles if a.category == category.upper()]
    return articles[:limit]


@app.get("/traffic", response_model=list[TrafficHotspot])
async def get_traffic():
    return traffic_cache


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "news_count": len(news_cache),
        "traffic_hotspots": len(traffic_cache),
        "last_update": datetime.now(timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=RELOAD)
