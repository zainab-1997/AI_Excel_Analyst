import plotly.express as px
import pandas as pd


def create_chart(df):

    charts = []

    numeric_columns = df.select_dtypes(include="number").columns.tolist()
    text_columns = df.select_dtypes(include="object").columns.tolist()
    date_columns = df.select_dtypes(include=["datetime", "datetimetz"]).columns.tolist()

    # محاولة تحويل أعمدة نصية إلى تواريخ
    if not date_columns:
        for col in text_columns:
            try:
                converted = pd.to_datetime(df[col], errors="coerce")
                if converted.notna().sum() > len(df) * 0.5:
                    date_columns.append(col)
            except Exception:
                pass

    if not numeric_columns:
        return charts

    num_col = numeric_columns[0]

    # Bar Chart — نصي مقابل رقمي
    if text_columns:
        text_col = text_columns[0]

        fig_bar = px.bar(
            df,
            x=text_col,
            y=num_col,
            title=f"{num_col} by {text_col}",
            color=num_col,
            color_continuous_scale="Blues",
        )
        charts.append(fig_bar)

        # Pie Chart — إذا كانت القيم الفريدة معقولة
        unique_count = df[text_col].nunique()
        if 2 <= unique_count <= 15:
            pie_data = df.groupby(text_col)[num_col].sum().reset_index()
            fig_pie = px.pie(
                pie_data,
                names=text_col,
                values=num_col,
                title=f"Distribution of {num_col} by {text_col}",
            )
            charts.append(fig_pie)

    # Line Chart — إذا وجد عمود تاريخ
    if date_columns:
        date_col = date_columns[0]
        df_sorted = df.sort_values(date_col)
        fig_line = px.line(
            df_sorted,
            x=date_col,
            y=num_col,
            title=f"{num_col} over Time",
            markers=True,
        )
        charts.append(fig_line)

    # Line Chart بديل — إذا لا يوجد تاريخ لكن يوجد أكثر من عمود رقمي
    elif len(numeric_columns) >= 2:
        fig_multi = px.line(
            df.reset_index(),
            y=numeric_columns[:3],
            title="Numeric Columns Trend",
            markers=True,
        )
        charts.append(fig_multi)

    return charts
