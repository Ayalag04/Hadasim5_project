import pandas as pd
import os

file_path = "time_series.xlsx"
df = pd.read_excel(file_path)

# בדיקת פורמט תאריך
if "timestamp" in df.columns:
    try:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce") # המרה לתאריך 
    except Exception as e:
        print(f"שגיאה בהמרת הזמן: {e}")
else:
    raise ValueError("קובץ ה-Excel אינו מכיל עמודת timestamp")

# בדיקת כפילויות
duplicates = df.duplicated()
if duplicates.any():
    print(f"נמצאו {duplicates.sum()} כפילויות. הן יוסרו.")
    df = df.drop_duplicates()

#בדיקות נוספות שלי
#אם יש ערכים שלא הצלחתי להמיר למעלה  אז מבצעת בדיקה עליהם
invalidTimestamps = df[df["timestamp"].isna()]
if not invalidTimestamps.empty:
    print("נמצא זמן לא תקין. השורות יוסרו.")
    df = df.dropna(subset=["timestamp"])  # הסרת השורות 


if "value" in df.columns: # בדיקה שהעמודה קיימת 
    df["value"] = pd.to_numeric(df["value"], errors="coerce") # המרה לסמפרים
else:
    raise ValueError("קובץ ה-Excel אינו מכיל עמודת value")

# בדיקה אם יש ערכים חסרים בעמודת המספרים ואם כן נכניס להם את הממוצע
if df["value"].isna().sum() > 0:
    mean_value = df["value"].mean()
    print(f"נמצאו ערכים חסרים בעמודת value, הם יושלמו עם הערך הממוצע: {mean_value:.2f}")
    df["value"].fillna(mean_value, inplace=True)

# בדיקה אם קיימים ערכים שליליים
negativeValues = df[df["value"] < 0]
if not negativeValues.empty:
    print("נמצאו ערכים שליליים בעמודת value. הם יוסרו מהנתונים.")
    df = df[df["value"] >= 0]  # שמירה רק על ערכים שאינם שליליים


# שמירה לאחר תיקונים בקובץ חדש 
df.to_excel("time_series_cleaned.xlsx", index=False)
print("הנתונים נוקו ונשמרו בקובץ time_series_cleaned.xlsx")


# קריאת הקובץ הנקי
file_path = "time_series_cleaned.xlsx"
df = pd.read_excel(file_path)
df["date"] = df["timestamp"].dt.date

# יצירת תיקייה לאחסון הקבצים היומיים
os.makedirs("daily_chunks", exist_ok=True)


for date, group in df.groupby(df["timestamp"].dt.date):  # חלוקה לפי תאריך עפי עמודת התאריך
    # שמירה רק את העמודות timestamp ו-value
    group[["timestamp", "value"]].to_excel(f"daily_chunks/{date}.xlsx", index=False)
    print(f"שמירה של נתוני היום {date} הושלמה.")

# חישוב ממוצעים שעתיים עבור כל קובץ ואיחוד תוצאות
finalResult = pd.DataFrame()

for file in os.listdir("daily_chunks"):
    if file.endswith(".xlsx"):
        dailyData = pd.read_excel(f"daily_chunks/{file}")

        # עיגול הזמנים לרמת שעה כדי שאוכל לקחת את כל השעות בטווח השעה הזאת 
        dailyData["hour"] = dailyData["timestamp"].dt.floor("H")

        # חישוב ממוצע ערכים לפי שעה
        hourlyAvg = dailyData.groupby("hour")["value"].mean().reset_index()

        # הוספת התוצאות לקובץ הסופי
        finalResult = pd.concat([finalResult, hourlyAvg], ignore_index=True)

# חישוב ממוצע כללי לפי שעה
finalHourlyAvg = finalResult.groupby("hour")["value"].mean().reset_index()

# שמירה של התוצאה הסופית
finalHourlyAvg.to_excel("finalHourlyAveragesExel.xlsx", index=False)
print("איחוד התוצאות הושלם ונשמר בקובץ finalHourlyAveragesExel.xlsx")