from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import pandas as pd
import io
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analysis_engine import analyze_data
from data_profiler import profile_dataframe
from chat_agent import ask_data
from report_agent import generate_report
from database import init_db, save_report, get_reports

app = FastAPI(title="AI Excel SaaS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# Serve built React files in production
_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.isdir(_dist):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse as _FR
    app.mount("/assets", StaticFiles(directory=os.path.join(_dist, "assets")), name="assets")

    @app.get("/")
    async def _root(): return _FR(os.path.join(_dist, "index.html"))

    @app.get("/{full_path:path}")
    async def _spa(full_path: str):
        p = os.path.join(_dist, full_path)
        return _FR(p if os.path.isfile(p) else os.path.join(_dist, "index.html"))


@app.post("/analyze/")
async def analyze(file: UploadFile = File(...)):
    try:
        content = await file.read()
        sheets  = pd.read_excel(io.BytesIO(content), sheet_name=None)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot read Excel file: {e}")

    sheet_results = []
    for sheet_name, df in sheets.items():
        if df is None or df.empty:
            continue
        try:
            profile  = profile_dataframe(df)
            analysis = analyze_data(df)
        except Exception as e:
            profile  = {"data_type": "Unknown", "rows": 0, "columns": []}
            analysis = {"error": str(e)}
        sheet_results.append({
            "sheet":    str(sheet_name),
            "profile":  profile,
            "analysis": analysis,
        })

    first = sheet_results[0] if sheet_results else {}
    return {
        "profile": first.get("profile",  {}),
        "analysis": first.get("analysis", {}),
        "sheets":  sheet_results,
    }


@app.post("/compare/")
async def compare(files: list[UploadFile] = File(...)):
    dfs, totals, results = [], [], []

    for f in files:
        df = pd.read_excel(f.file)
        dfs.append(df)

    for df in dfs:
        analysis = analyze_data(df)
        if "error" in analysis:
            return {"error": analysis["error"]}

        numeric_keys = [
            k for k in analysis
            if isinstance(analysis[k], dict) and "total" in analysis[k]
        ]
        if not numeric_keys:
            return {"error": "No numeric column found"}

        data = analysis[numeric_keys[0]]
        results.append(data)
        totals.append(data["total"])

    growth = 0.0
    if len(totals) >= 2 and totals[0] != 0:
        growth = ((totals[1] - totals[0]) / totals[0]) * 100

    return {"file_results": results, "totals": totals, "growth_percent": growth}


class ChatRequest(BaseModel):
    question: str
    analysis: str
    samples:  str
    language: str = "English"

@app.post("/chat/")
async def chat(req: ChatRequest):
    answer = ask_data(req.question, req.analysis, req.samples)
    return {"answer": answer}


class ReportRequest(BaseModel):
    analysis:    str
    report_type: str = "Business Analysis"
    samples:     str = ""
    language:    str = "English"

@app.post("/report/")
async def report(req: ReportRequest):
    text = generate_report(req.analysis, req.report_type, req.samples, req.language, "AI Report")
    save_report(req.report_type, text)
    return {"report": text}


@app.get("/history/")
async def history():
    rows = get_reports()
    return {
        "reports": [
            {"id": r[0], "date": r[1], "report_type": r[2], "report": r[3]}
            for r in rows
        ]
    }


class PDFRequest(BaseModel):
    text:        str
    report_type: str = "Report"

@app.post("/pdf/")
async def export_pdf(req: PDFRequest):
    try:
        from pdf_report import create_pdf
        buf = create_pdf(req.text)
        filename = req.report_type.replace(" ", "_") + ".pdf"
        return StreamingResponse(
            buf,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")
