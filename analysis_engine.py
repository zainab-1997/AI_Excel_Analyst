import pandas as pd
from collections import Counter
import re


def analyze_data(df):

    try:

        result = {}

        if df is None or df.empty:
            return {"error": "Empty dataset"}

        df = df.copy()

        for col in df.columns:
            try:
                cleaned = (
                    df[col]
                    .astype(str)
                    .str.replace(",", "", regex=False)
                    .str.replace("$", "", regex=False)
                    .str.replace("IQD", "", regex=False)
                    .str.strip()
                )
                converted = pd.to_numeric(cleaned, errors="coerce")
                if converted.notna().sum() > 0:
                    df[col] = converted
            except Exception:
                pass

        text_columns = df.select_dtypes(include="object").columns
        numeric_columns = df.select_dtypes(include="number").columns

        if len(numeric_columns) > 0:

            value_col = numeric_columns[0]
            series = df[value_col].dropna()

            numeric_result = {
                "total": float(series.sum()),
                "average": round(float(series.mean()), 2),
                "maximum": float(series.max()),
                "minimum": float(series.min()),
            }

            # top_item / lowest_item من عمود نصي إن وجد
            if len(text_columns) > 0:
                label_col = text_columns[0]
                grouped = df.groupby(label_col)[value_col].sum().dropna()

                if not grouped.empty:
                    numeric_result["top_item"] = str(grouped.idxmax())
                    numeric_result["lowest_item"] = str(grouped.idxmin())
                    numeric_result["ranking"] = dict(
                        grouped.sort_values(ascending=False)
                        .head(10)
                        .items()
                    )
            else:
                numeric_result["top_item"] = "-"
                numeric_result["lowest_item"] = "-"

            result[value_col] = numeric_result

        if len(text_columns) > 0:

            result["text_analysis"] = {}

            for col in text_columns:

                text = " ".join(df[col].astype(str).tolist())
                words = re.findall(r'\w+', text)
                common = Counter(words).most_common(10)

                result["text_analysis"][col] = {
                    "count": int(df[col].count()),
                    "unique_values": int(df[col].nunique()),
                    "top_keywords": common
                }

        result["rows"] = len(df)
        result["columns"] = list(df.columns)

        return result

    except Exception as e:
        return {"error": str(e)}
