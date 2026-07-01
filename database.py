import sqlite3
from datetime import datetime


def init_db():

    conn = sqlite3.connect("reports.db")

    conn.execute("""
    CREATE TABLE IF NOT EXISTS reports (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        date TEXT,

        report_type TEXT,

        report TEXT

    )
    """)

    conn.commit()
    conn.close()



def save_report(report_type, report):

    conn = sqlite3.connect("reports.db")


    conn.execute(
        """
        INSERT INTO reports
        (date, report_type, report)

        VALUES (?, ?, ?)
        """,

        (
            datetime.now().strftime(
                "%Y-%m-%d %H:%M"
            ),

            report_type,

            report
        )
    )


    conn.commit()
    conn.close()



def get_reports():

    conn = sqlite3.connect("reports.db")


    data = conn.execute(
        """
        SELECT *
        FROM reports
        ORDER BY id DESC
        """
    ).fetchall()


    conn.close()


    return data