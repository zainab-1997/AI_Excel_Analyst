import os
from dotenv import load_dotenv

load_dotenv()


def generate_report(analysis, report_type="Business Analysis", samples="", language="English", title=""):
    try:
        from langchain_groq import ChatGroq

        llm = ChatGroq(
            groq_api_key=os.getenv("GROQ_API_KEY"),
            model_name="llama-3.3-70b-versatile",
            temperature=0.3,
        )

        lang_instruction = (
            "Respond in Arabic only." if language == "Arabic" else "Respond in English only."
        )

        prompt = f"""You are an expert Business Intelligence Analyst.

Generate a professional {report_type} report based on the provided Excel data analysis.

Report Title: {title}

Structure the report as:
1. Executive Summary
2. Key Findings
3. Performance Highlights (top and lowest performers)
4. Root Cause Analysis
5. Strategic Recommendations
6. Action Plan

Data Analysis:
{analysis}

Sample Data:
{samples}

{lang_instruction}
Write in a clear, professional business tone.
"""
        response = llm.invoke(prompt)
        return response.content

    except Exception as e:
        return f"Report Error: {str(e)}"
