import pandas as pd
import os

# קריאת הקובץ
file_path = "time_series (4).parquet"
df = pd.read_parquet(file_path)

# בדיקה אם עמודת timestamp קיימת והמרה לפורמט datetime
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
# בדיקה אם קיימים ערכים לא חוקיים בעמודת הזמן (שלא הצליחו להמיר)
invalid_timestamps = df[df["timestamp"].isna()]
if not invalid_timestamps.empty:
    print("נמצאו חותמות זמן לא תקינות. השורות יוסרו.")
    df = df.dropna(subset=["timestamp"])  # הסרת שורות עם תאריך לא חוקי

# בדיקה אם עמודת mean_value קיימת והמרה למספרים
if "mean_value" in df.columns:
    df["mean_value"] = pd.to_numeric(df["mean_value"], errors="coerce")
else:
    raise ValueError("קובץ ה-Parquet אינו מכיל עמודת mean_value")


# בדיקה אם יש ערכים חסרים בעמודת value והשלמה שלהם (נבחר למשל להשלים עם הממוצע)
if df["mean_value"].isna().sum() > 0:
    mean_value = df["mean_value"].mean()
    print(f"נמצאו ערכים חסרים בעמודת mean_value, הם יושלמו עם הערך הממוצע: {mean_value:.2f}")
    df["mean_value"].fillna(mean_value, inplace=True)

# בדיקה אם קיימים ערכים שליליים
negative_values = df[df["mean_value"] < 0]
if not negative_values.empty:
    print("נמצאו ערכים שליליים בעמודת mean_value. הם יוסרו מהנתונים.")
    df = df[df["mean_value"] >= 0]  # שמירה רק על ערכים שאינם שליליים

# שמירה חזרה לאחר תיקונים
df.to_parquet("time_series_cleaned.parquet", index=False) ##########################
print("הנתונים נוקו ונשמרו בקובץ time_series_cleaned.parquet")


# קריאת הקובץ הנקי
file_path = "time_series_cleaned.parquet" #########
df = pd.read_parquet(file_path)#############################
df["date"] = df["timestamp"].dt.date

# יצירת תיקייה לאחסון הקבצים היומיים
os.makedirs("daily_chunks", exist_ok=True)

# חלוקת הנתונים לחלקים יומיים ושמירה בקובץ
for date, group in df.groupby(df["timestamp"].dt.date):  # חלוקה לפי תאריך מתוך timestamp
    # שמירה רק את העמודות timestamp ו-mean_value
    group[["timestamp", "mean_value"]].to_parquet(f"daily_chunks/{date}.parquet", index=False)
    print(f"שמירה של נתוני היום {date} הושלמה.")

# חישוב ממוצעים שעתיים עבור כל קובץ יומי ואיחוד תוצאות
final_result = pd.DataFrame()

for file in os.listdir("daily_chunks"):
    if file.endswith(".parquet"):
        daily_data = pd.read_parquet(f"daily_chunks/{file}")

        # עיגול חותמת הזמן לרמת שעה
        daily_data["hour"] = daily_data["timestamp"].dt.floor("H")

        # חישוב ממוצע ערכים לפי שעה
        hourly_avg = daily_data.groupby("hour")["mean_value"].mean().reset_index()

        # הוספת התוצאות לקובץ הסופי
        final_result = pd.concat([final_result, hourly_avg], ignore_index=True)

# חישוב ממוצע כללי לפי שעה
final_hourly_avg = final_result.groupby("hour")["mean_value"].mean().reset_index()

# שמירה של התוצאה הסופית
final_hourly_avg.to_excel("hourly_averages_final.xlsx", index=False)
print("איחוד התוצאות הושלם ונשמר בקובץ hourly_averages_final.xlsx")


#קבצי Parquet הם קבצים שמאורגנים בפורמט עמודתי, בניגוד לרוב הקבצים שמסודרים בשורות,
#ולכן יש הלם מספר יתרונות. קודם כל, הם תומכים בדחיסה, מה שאומר שהקבצים קטנים יותר וקל יותר לקרוא ולכתוב להם.
#בנוסף, בגלל הפורמט העמודתי, המערכת פועלת הרבה יותר מהר כשצריך לגשת למידע מעמודות ספציפיות
#יתרון נוסף הוא שהם יכולים לשמור סוגים מורכבים של נתונים, כמו שעשינו בקוד שלנו, מה שעוזר לנו לנתח נתונים לא מובנים בקלות, כמו לחשב ממוצעים שעתיים, ולהשיג ביצועים טובים יותר בשאילתות.