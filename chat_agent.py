import os
from dotenv import load_dotenv

load_dotenv()


def ask_data(question, analysis, data_sample):
    try:
        from langchain_groq import ChatGroq

        llm = ChatGroq(
            groq_api_key=os.getenv("GROQ_API_KEY"),
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
        )

        prompt = f"""You are an AI Business Intelligence Analyst.

Analyze the Excel data and provide professional business insights.

Rules:
- Use ONLY the provided Excel analysis and sample data.
- Do not invent information.
- If information is unavailable, clearly mention that.

When answering business questions, structure the answer as:
1. Executive Summary
2. Key Findings
3. Root Causes
4. Recommendations
5. Action Plan

For customer feedback, hospitals, pharmacies, or sales notes:
- Identify repeated problems.
- Highlight pricing issues.
- Identify competitor impact.
- Suggest customer follow-up actions.

Excel Analysis:
{analysis}

Sample Data:
{data_sample}

User Question:
{question}

Answer language:
Use Arabic if the user asks in Arabic.
Use English if the user asks in English.
"""
        response = llm.invoke(prompt)
        return response.content

    except Exception as e:
        return f"AI Error: {str(e)}"
