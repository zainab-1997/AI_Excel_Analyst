import pandas as pd


def profile_dataframe(df):

    profile = {}

    profile["rows"] = len(df)
    profile["columns"] = list(df.columns)

    profile["numeric_columns"] = list(
        df.select_dtypes(include="number").columns
    )

    profile["text_columns"] = list(
        df.select_dtypes(include="object").columns
    )

    columns_text = " ".join(
        [str(c).lower() for c in df.columns]
    )

    sales_keywords = [
        # English
        "sales", "revenue", "amount", "price", "total", "income",
        # Arabic
        "مبيعات", "إيراد", "ايراد", "مبلغ", "سعر", "إجمالي", "اجمالي", "دخل"
    ]

    hr_keywords = [
        # English
        "employee", "staff", "salary", "performance", "hr",
        # Arabic
        "موظف", "موظفين", "راتب", "رواتب", "أداء", "اداء", "كادر"
    ]

    inventory_keywords = [
        # English
        "stock", "inventory", "quantity", "warehouse",
        # Arabic
        "مخزون", "كمية", "مستودع", "بضاعة", "مواد"
    ]

    customer_keywords = [
        # English
        "customer", "client", "feedback", "complaint",
        # Arabic
        "عميل", "عملاء", "زبون", "زبائن", "شكوى", "تغذية"
    ]

    if any(w in columns_text for w in sales_keywords):
        profile["data_type"] = "Sales / Business"

    elif any(w in columns_text for w in hr_keywords):
        profile["data_type"] = "HR / Employees"

    elif any(w in columns_text for w in inventory_keywords):
        profile["data_type"] = "Inventory"

    elif any(w in columns_text for w in customer_keywords):
        profile["data_type"] = "Customer Data"

    else:
        profile["data_type"] = "General Data"

    return profile
