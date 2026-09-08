from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DR Screening XAI API")

# Allow Next.js frontend to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Retinal Screening XAI"}


@app.get("/up")
def up_check():
    return {"status": "up"}


@app.post("/api/predict")
async def predict_dr(file: UploadFile = File(...)):
    # Mock response to test end-to-end frontend integration
    return {
        "severity": "Moderate NPDR (Grade 2)",
        "confidence": 0.87,
        "recommendation": "Referral to ophthalmologist within 4–6 weeks.",
        "findings": ["Microaneurysms detected in central macula", "Dot hemorrhages present"]
    }