import pandas as pd
import os

# קריאת הקובץ
file_path = "time_series.xlsx"
df = pd.read_excel(file_path)

# בדיקה אם עמודת timestamp קיימת והמרה לפורמט datetime
if "timestamp" in df.columns:
    try:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    except Exception as e:
        print(f"שגיאה בהמרת חותמות הזמן: {e}")
else:
    raise ValueError("קובץ ה-Excel אינו מכיל עמודת timestamp")

# בדיקת כפילויות
duplicates = df.duplicated()
if duplicates.any():
    print(f"נמצאו {duplicates.sum()} כפילויות. הן יוסרו.")
    df = df.drop_duplicates()

#בדיקות נוספות שלי
# בדיקה אם קיימים ערכים לא חוקיים בעמודת הזמן (שלא הצליחו להמיר)
invalid_timestamps = df[df["timestamp"].isna()]
if not invalid_timestamps.empty:
    print("נמצאו חותמות זמן לא תקינות. השורות יוסרו.")
    df = df.dropna(subset=["timestamp"])  # הסרת שורות עם תאריך לא חוקי

# בדיקה אם עמודת value קיימת והמרה למספרים
if "value" in df.columns:
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
else:
    raise ValueError("קובץ ה-Excel אינו מכיל עמודת value")

# בדיקה אם יש ערכים חסרים בעמודת value והשלמה שלהם (נבחר למשל להשלים עם הממוצע)
if df["value"].isna().sum() > 0:
    mean_value = df["value"].mean()
    print(f"נמצאו ערכים חסרים בעמודת value, הם יושלמו עם הערך הממוצע: {mean_value:.2f}")
    df["value"].fillna(mean_value, inplace=True)

# בדיקה אם קיימים ערכים שליליים
negative_values = df[df["value"] < 0]
if not negative_values.empty:
    print("נמצאו ערכים שליליים בעמודת value. הם יוסרו מהנתונים.")
    df = df[df["value"] >= 0]  # שמירה רק על ערכים שאינם שליליים


# שמירה חזרה לאחר תיקונים
df.to_excel("time_series_cleaned.xlsx", index=False)
print("הנתונים נוקו ונשמרו בקובץ time_series_cleaned.xlsx")


# קריאת הקובץ הנקי
file_path = "time_series_cleaned.xlsx"
df = pd.read_excel(file_path)
df["date"] = df["timestamp"].dt.date

# יצירת תיקייה לאחסון הקבצים היומיים
os.makedirs("daily_chunks", exist_ok=True)

# חלוקת הנתונים לחלקים יומיים ושמירה בקובץ
for date, group in df.groupby(df["timestamp"].dt.date):  # חלוקה לפי תאריך מתוך timestamp
    # שמירה רק את העמודות timestamp ו-value
    group[["timestamp", "value"]].to_excel(f"daily_chunks/{date}.xlsx", index=False)
    print(f"שמירה של נתוני היום {date} הושלמה.")

# חישוב ממוצעים שעתיים עבור כל קובץ יומי ואיחוד תוצאות
final_result = pd.DataFrame()

for file in os.listdir("daily_chunks"):
    if file.endswith(".xlsx"):
        daily_data = pd.read_excel(f"daily_chunks/{file}")

        # עיגול חותמת הזמן לרמת שעה
        daily_data["hour"] = daily_data["timestamp"].dt.floor("H")

        # חישוב ממוצע ערכים לפי שעה
        hourly_avg = daily_data.groupby("hour")["value"].mean().reset_index()

        # הוספת התוצאות לקובץ הסופי
        final_result = pd.concat([final_result, hourly_avg], ignore_index=True)

# חישוב ממוצע כללי לפי שעה
final_hourly_avg = final_result.groupby("hour")["value"].mean().reset_index()

# שמירה של התוצאה הסופית
final_hourly_avg.to_excel("hourly_averages_final.xlsx", index=False)
print("איחוד התוצאות הושלם ונשמר בקובץ hourly_averages_final.xlsx")