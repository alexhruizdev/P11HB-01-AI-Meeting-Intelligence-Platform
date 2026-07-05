from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from ai_routes import router as ai_router

app = FastAPI(
    title="P11HB-01 | AI Meeting Intelligence Platform",
    version="1.0.0"
)

# Permitir conexiones desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {
        "project": "P11HB-01 | AI Meeting Intelligence Platform",
        "status": "running"
    }

@app.get("/health")
def health():
    return {
        "status": "ok"
    }

@app.get("/test123")
def test123():
    return {"ok": True}