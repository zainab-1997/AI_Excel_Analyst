import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import requests
import tempfile


from analysis_engine import analyze_data
from report_agent import generate_report
from visualization import create_chart
from chat_agent import ask_data
from database import init_db, save_report, get_reports
from pdf_report import create_pdf
from comparison_engine import compare_excels
from data_profiler import profile_dataframe



# =====================
# CONFIG
# =====================

st.set_page_config(
    page_title="AI Excel Intelligence PRO",
    page_icon="📊",
    layout="wide"
)


init_db()



st.title(
    "📊 AI Excel Intelligence PRO"
)


st.markdown(
    "Unified AI Business Intelligence System"
)



# =====================
# API CONNECTION SAFE
# =====================

def send_to_api(file):

    try:

        url = "http://127.0.0.1:8000/analyze/"


        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".xlsx"
        ) as tmp:


            tmp.write(
                file.getbuffer()
            )


            path = tmp.name



        with open(path,"rb") as f:


            response = requests.post(
                url,
                files={
                    "file":f
                },
                timeout=10
            )


        return response.json()


    except Exception:


        return None




# =====================
# SIDEBAR
# =====================


language = st.sidebar.selectbox(

    "Language",

    [
        "English",
        "Arabic"
    ]

)



uploaded_files = st.sidebar.file_uploader(

    "Upload Excel Files",

    type=["xlsx"],

    accept_multiple_files=True

)




# =====================
# TABS
# =====================


tab1, tab2, tab3, tab4, tab5 = st.tabs(

    [

        "📊 Dashboard",

        "🤖 AI Report",

        "💬 Chat",

        "📚 History",

        "⚖️ Comparison"

    ]

)




# =====================
# STORAGE
# =====================


all_data = []

all_analysis = []

all_profiles = []

file_names = []




# =====================
# LOAD FILES
# =====================


if uploaded_files:


    for file in uploaded_files:


        try:


            excel = pd.ExcelFile(file)


            sheet = st.sidebar.selectbox(

                f"Sheet - {file.name}",

                excel.sheet_names,

                key=file.name

            )



            df = pd.read_excel(

                file,

                sheet_name=sheet

            )



            profile = profile_dataframe(df)


            analysis = analyze_data(df)



            all_data.append(df)

            all_analysis.append(analysis)

            all_profiles.append(profile)

            file_names.append(file.name)



        except Exception as e:


            st.error(

                f"{file.name}: {e}"

            )



else:


    st.info(
        "Upload Excel files to start"
    )
    # =====================
# DASHBOARD
# =====================

with tab1:


    if all_data:


        st.subheader(
            "📊 Multi File Dashboard"
        )



        for i, df in enumerate(all_data):


            st.markdown(
                f"## 📁 {file_names[i]}"
            )



            profile = all_profiles[i]

            analysis = all_analysis[i]



            if "error" in analysis:

                st.error(
                    analysis["error"]
                )

                continue



            st.dataframe(
                df,
                use_container_width=True
            )



            c1,c2,c3 = st.columns(3)



            with c1:

                st.metric(
                    "Rows",
                    profile.get(
                        "rows",
                        "-"
                    )
                )



            with c2:

                st.metric(
                    "Columns",
                    len(
                        profile.get(
                            "columns",
                            []
                        )
                    )
                )



            with c3:

                st.metric(
                    "Type",
                    profile.get(
                        "data_type",
                        "Unknown"
                    )
                )




            main_key = list(
                analysis.keys()
            )[0]


            data = analysis[main_key]



            st.subheader(
                "📈 KPIs"
            )



            a,b,c,d = st.columns(4)



            with a:

                st.metric(
                    "Total",
                    data.get(
                        "total",
                        0
                    )
                )



            with b:

                st.metric(
                    "Average",
                    data.get(
                        "average",
                        0
                    )
                )



            with c:

                st.metric(
                    "Top Item",
                    data.get(
                        "top_item",
                        "-"
                    )
                )



            with d:

                st.metric(
                    "Lowest Item",
                    data.get(
                        "lowest_item",
                        "-"
                    )
                )




            if "ranking" in data:


                st.subheader(
                    "🏆 Ranking"
                )


                rank = pd.DataFrame(

                    data["ranking"].items(),

                    columns=[
                        "Item",
                        "Value"
                    ]

                )


                st.dataframe(
                    rank,
                    use_container_width=True
                )




            st.subheader(
                "📊 Charts"
            )



            try:


                charts = create_chart(df)


                for chart in charts:


                    st.plotly_chart(

                        chart,

                        use_container_width=True

                    )


            except:


                st.info(
                    "No charts available"
                )



            st.divider()



    else:


        st.info(
            "Upload files first"
        )






# =====================
# AI REPORT
# =====================

with tab2:


    st.subheader(
        "🤖 Unified AI Report"
    )



    report_type = st.selectbox(

        "Report Type",

        [

            "Executive Summary",

            "Business Analysis",

            "Performance",

            "Recommendations"

        ]

    )



    if all_analysis and st.button(
        "Generate AI Report 🚀"
    ):



        context = ""


        samples = ""



        for i,a in enumerate(all_analysis):


            context += (

                f"\nFILE {file_names[i]}\n"

                f"{a}\n"

            )



            samples += (

                f"\n{file_names[i]}\n"

                f"{all_data[i].head(5)}\n"

            )




        report = generate_report(

            context,

            report_type,

            samples,

            language,

            "Multi File Intelligence"

        )



        save_report(

            report_type,

            report

        )



        st.write(report)



        pdf = create_pdf(report)



        st.download_button(

            "Download PDF",

            pdf,

            "AI_Report.pdf",

            "application/pdf"

        )
        # =====================
# CHAT
# =====================

with tab3:


    st.subheader(
        "💬 AI Chat - All Files"
    )



    question = st.text_input(
        "Ask about your data"
    )



    if question and all_analysis:


        context = ""


        for i,a in enumerate(all_analysis):


            context += (

                f"\nFILE {file_names[i]}\n"

                f"{a}\n"

            )



        all_samples = "\n".join(
            f"\n--- {file_names[i]} ---\n{df.head(5).to_string()}"
            for i, df in enumerate(all_data)
        )

        answer = ask_data(

            question,

            context,

            all_samples

        )



        st.write(answer)







# =====================
# HISTORY
# =====================

with tab4:


    st.subheader(
        "📚 Reports History"
    )



    reports = get_reports()



    if reports:


        for r in reports:


            with st.expander(

                f"{r[1]} - {r[2]}"

            ):


                st.write(
                    r[3]
                )


    else:


        st.info(
            "No saved reports"
        )







# =====================
# COMPARISON
# =====================

with tab5:


    st.subheader(
        "⚖️ Smart Comparison"
    )



    if len(all_data) >= 2:



        file_a = st.selectbox(

            "Select File A",

            range(
                len(all_data)
            ),

            format_func=lambda x:
            file_names[x]

        )



        file_b = st.selectbox(

            "Select File B",

            range(
                len(all_data)
            ),

            format_func=lambda x:
            file_names[x]

        )



        if st.button(
            "Compare 🚀"
        ):



            result = compare_excels(

                all_data[file_a],

                all_data[file_b]

            )



            if "error" in result:


                st.error(
                    result["error"]
                )



            else:



                c1,c2,c3 = st.columns(3)



                with c1:


                    st.metric(

                        "File A Total",

                        result["total_file1"]

                    )



                with c2:


                    st.metric(

                        "File B Total",

                        result["total_file2"]

                    )



                with c3:


                    st.metric(

                        "Growth %",

                        round(
                            result["growth_percent"],
                            2
                        )

                    )




                st.subheader(
                    "Comparison Table"
                )


                st.dataframe(

                    result["table"],

                    use_container_width=True

                )



                fig = go.Figure()



                fig.add_bar(

                    name="File A",

                    x=["Total"],

                    y=[

                        result["total_file1"]

                    ]

                )



                fig.add_bar(

                    name="File B",

                    x=["Total"],

                    y=[

                        result["total_file2"]

                    ]

                )



                st.plotly_chart(

                    fig,

                    use_container_width=True

                )



    else:


        st.info(
            "Upload at least 2 Excel files"
        )







# =====================
# FORECAST BASIC
# =====================

st.sidebar.divider()


st.sidebar.subheader(
    "🔮 Forecast"
)



if all_data:


    df_forecast = all_data[0]


    numeric = df_forecast.select_dtypes(

        include="number"

    ).columns



    if len(numeric)>0:


        value = numeric[0]


        avg = df_forecast[value].mean()



        st.sidebar.metric(

            "Expected Average",

            round(avg,2)

        )

    else:


        st.sidebar.info(

            "No numeric data for forecast"

        )
