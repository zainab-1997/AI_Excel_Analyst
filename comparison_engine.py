import pandas as pd


def compare_excels(df1, df2):

    try:

        if df1.empty or df2.empty:
            return {
                "error": "Empty file"
            }


        text1 = df1.select_dtypes(
            include="object"
        ).columns


        text2 = df2.select_dtypes(
            include="object"
        ).columns


        num1 = df1.select_dtypes(
            include="number"
        ).columns


        num2 = df2.select_dtypes(
            include="number"
        ).columns



        if len(num1) == 0 or len(num2) == 0:

            return {
                "error": "No numeric column found"
            }



        value1 = num1[0]
        value2 = num2[0]



        total1 = df1[value1].sum()

        total2 = df2[value2].sum()



        if total1 != 0:

            growth = (
                (total2-total1)
                /
                total1
            ) * 100

        else:

            growth = 0



        # مقارنة حسب العنصر

        if len(text1) > 0 and len(text2) > 0:


            g1 = (
                df1.groupby(text1[0])[value1]
                .sum()
            )


            g2 = (
                df2.groupby(text2[0])[value2]
                .sum()
            )


            table = pd.DataFrame({

                "File 1": g1,

                "File 2": g2

            }).fillna(0)



            table["Difference"] = (
                table["File 2"]
                -
                table["File 1"]
            )


        else:


            table = pd.DataFrame({

                "File 1": [total1],

                "File 2": [total2]

            })



        return {

            "total_file1": float(total1),

            "total_file2": float(total2),

            "growth_percent": float(growth),

            "table": table

        }



    except Exception as e:


        return {

            "error": str(e)

        }