import asyncio
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from tools.db_manager import init_db
from tools.embedding_extractor import get_encoder
from app.session_store import cleanup_loop
from app.routes import enrollment, detection, registry

app = FastAPI(title="Voice Biometric API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(enrollment.router)
app.include_router(detection.router)
app.include_router(registry.router)


@app.on_event("startup")
async def startup():
    init_db()
    asyncio.create_task(cleanup_loop())
    asyncio.get_event_loop().run_in_executor(None, get_encoder)


@app.get("/health")
def health():
    from tools.db_manager import list_profiles
    return {"status": "ok", "profiles_count": len(list_profiles())}


app.mount("/", StaticFiles(directory="static", html=True), name="static")
