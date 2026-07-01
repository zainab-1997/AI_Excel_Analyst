from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
from datetime import datetime

_ARABIC_FONT = "Helvetica"

try:
    pdfmetrics.registerFont(TTFont("Arial", "C:/Windows/Fonts/arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"))
    _ARABIC_FONT = "Arial"
except Exception:
    pass


def _contains_arabic(text):
    return any('؀' <= c <= 'ۿ' for c in text)


def _reshape_arabic(text):
    try:
        import arabic_reshaper
        from bidi.algorithm import get_display
        reshaped = arabic_reshaper.reshape(text)
        return get_display(reshaped)
    except ImportError:
        return text


def create_pdf(report_text):

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer)
    styles = getSampleStyleSheet()

    is_arabic = _contains_arabic(report_text)

    if is_arabic:
        body_style = ParagraphStyle(
            "ArabicBody",
            parent=styles["Normal"],
            alignment=TA_RIGHT,
            fontName=_ARABIC_FONT,
            fontSize=11,
            leading=20,
        )
        title_style = ParagraphStyle(
            "ArabicTitle",
            parent=styles["Title"],
            alignment=TA_RIGHT,
            fontName=_ARABIC_FONT,
            fontSize=16,
        )
    else:
        body_style = styles["Normal"]
        title_style = styles["Title"]

    story = []

    title = "AI Excel Intelligence Report"
    if is_arabic:
        title = _reshape_arabic(title)

    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 12))
    story.append(
        Paragraph(
            f"Date: {datetime.now().strftime('%Y-%m-%d')}",
            body_style
        )
    )
    story.append(Spacer(1, 12))

    for line in report_text.split("\n"):
        if line.strip():
            display_line = _reshape_arabic(line) if is_arabic else line
            story.append(Paragraph(display_line, body_style))
            story.append(Spacer(1, 6))

    doc.build(story)
    buffer.seek(0)

    return buffer
