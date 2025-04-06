import pandas as pd

# קריאת קובץ ה-Parquet
file_path = "time_series (4).parquet"
df = pd.read_parquet(file_path)

# הדפסת העמודות
print("עמודות הקובץ:", df.columns.tolist())
