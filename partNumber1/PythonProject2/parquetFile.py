import pandas as pd
import os

file_path = "time_series (4).parquet" 
df = pd.read_parquet(file_path)


if "timestamp" in df.columns:
    try:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    except Exception as e:
        print(f"שגיאה בהמרת חותמות הזמן: {e}")
else:
    raise ValueError("קובץ ה-parquet אינו מכיל עמודת timestamp")

# בדיקת כפילויות
duplicates = df.duplicated()
if duplicates.any():
    print(f"נמצאו {duplicates.sum()} כפילויות. הן יוסרו.")
    df = df.drop_duplicates()

#בדיקות נוספות שלי

invalidTimestamps = df[df["timestamp"].isna()]
if not invalidTimestamps.empty:
    print("נמצאו חותמות זמן לא תקינות. השורות יוסרו.")
    df = df.dropna(subset=["timestamp"])  # הסרת שורות

if "mean_value" in df.columns: # אם עמודה זו קיימת
    df["mean_value"] = pd.to_numeric(df["mean_value"], errors="coerce") #המרה למספר 
else:
    raise ValueError("קובץ ה-Parquet אינו מכיל עמודת mean_value")

# בדיקה אם יש ערכים חסרים בעמודת המספרים ואם כן נכניס להם את הממוצע
if df["mean_value"].isna().sum() > 0:
    mean_value = df["mean_value"].mean()
    print(f"נמצאו ערכים חסרים בעמודת mean_value, הם יושלמו עם הערך הממוצע: {mean_value:.2f}")
    df["mean_value"].fillna(mean_value, inplace=True)

# בדיקה אם קיימים ערכים שליליים
negativevalues = df[df["mean_value"] < 0]
if not negativevalues.empty:
    print("נמצאו ערכים שליליים בעמודת mean_value. הם יוסרו מהנתונים.")
    df = df[df["mean_value"] >= 0]  # שמירה רק על ערכים שאינם שליליים

# שמירה  לאחר תיקונים
df.to_parquet("time_series_cleaned.parquet", index=False) ###
print("הנתונים נוקו ונשמרו בקובץ time_series_cleaned.parquet")


# קריאת הקובץ הנקי
file_path = "time_series_cleaned.parquet" ###
df = pd.read_parquet(file_path)###
df["date"] = df["timestamp"].dt.date

# יצירת תיקייה לאחסון הקבצים היומיים
os.makedirs("daily_chunks", exist_ok=True)

# חלוקת הנתונים לחלקים יומיים ושמירה בקובץ
for date, group in df.groupby(df["timestamp"].dt.date):  # חלוקה לפי תאריך מתוך עמודת התאריך
    # שמירה רק את העמודות timestamp ו-mean_value
    group[["timestamp", "mean_value"]].to_parquet(f"daily_chunks/{date}.parquet", index=False)
    print(f"שמירה של נתוני היום {date} הושלמה.")

# חישוב ממוצעים שעתיים עבור כל קובץ יומי ואיחוד תוצאות
finalResult = pd.DataFrame()

for file in os.listdir("daily_chunks"):
    if file.endswith(".parquet"):
        dailyData = pd.read_parquet(f"daily_chunks/{file}")

        # עיגול הזמנים לרמת שעה
        dailyData["hour"] = dailyData["timestamp"].dt.floor("H")

        # חישוב ממוצע ערכים לפי שעה
        hourlyAvg = dailyData.groupby("hour")["mean_value"].mean().reset_index()

        # הוספת התוצאות לקובץ הסופי
        finalResult = pd.concat([finalResult, hourlyAvg], ignore_index=True)

# חישוב ממוצע כללי לפי שעה
finalHourlyAvg = finalResult.groupby("hour")["mean_value"].mean().reset_index()

# שמירה של התוצאה הסופית
finalHourlyAvg.to_excel("finalHourlyAverages.xlsx", index=False)
print("איחוד התוצאות הושלם ונשמר בקובץ finalHourlyAverages.xlsx")


#קבצי Parquet הם קבצים שמאורגנים בפורמט עמודתי, בניגוד לרוב הקבצים שמסודרים בשורות,
#ולכן יש הלם מספר יתרונות. קודם כל, הם תומכים בדחיסה, מה שאומר שהקבצים קטנים יותר וקל יותר לקרוא ולכתוב להם.
#בנוסף, בגלל הפורמט העמודתי, המערכת פועלת הרבה יותר מהר כשצריך לגשת למידע מעמודות ספציפיות
#יתרון נוסף הוא שהם יכולים לשמור סוגים מורכבים של נתונים, כמו שעשינו בקוד שלנו, מה שעוזר לנו לנתח נתונים לא מובנים בקלות, כמו לחשב ממוצעים שעתיים, ולהשיג ביצועים טובים יותר בשאילתות.