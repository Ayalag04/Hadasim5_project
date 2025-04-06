#חלוקת הקובץ לתתי קבצים
import pandas as pd #קורא קבצי אקסל
from collections import Counter
import glob
import os  # יבוא מודול os לניהול תיקיות

# יצירת תיקייה לשמירת תתי הקבצים
output_dir = "log_chunks"  # שם התיקייה
os.makedirs(output_dir, exist_ok=True)  # יצירת התיקייה אם היא לא קיימת

# קריאת הקובץ
file_path = "logs.txt.xlsx"
df = pd.read_excel(file_path, header=None) #שלא יהיו כותורות
df.columns = ["log"] #שם לעמודה
df["error_code"] = df["log"].str.extract(r'Error:\s(\w+_\d+)')

# קביעת גודל החלקים
chunk_size = 100000  # מספר השורות בכל חלק
num_chunks = len(df) // chunk_size + 1  # חישוב מספר החלקים(לכמה חלקים סהכ חילקתי את הקובץ)

# שמירת החלקים לקבצים נפרדים
for i in range(num_chunks): #עובר על החלקים
    start_row = i * chunk_size
    end_row = start_row + chunk_size
    chunk = df.iloc[start_row:end_row]  # קבלת החלק לפי טווח השורות לדוגמא בין 100000-200000
    chunk.to_csv(os.path.join(output_dir, f'logs_part_{i + 1}.csv'), index=False)  # שמירה כקובץ CSV בתיקייה

print(f"Saved {num_chunks} chunks.")


# חישוב שכיחות קודי השגיאה עבור כל חלק
chunk_files = glob.glob('log_chunks/logs_part_*.csv')
error_counter = Counter()  # לנהל את ספירת השגיאות

for file in chunk_files: #עובר על כל הקבצים
    chunk_df = pd.read_csv(file)  # קריאת הקובץ הנוכחי
    error_codes = chunk_df['error_code'].dropna()  # חיפוש קודי השגיאה
    error_counter.update(error_codes)  #  עדכון הספירה
    #update מבצע צבירה של הערכים שה counter סוכם

N = int(input("אנא הזן את מספר קודי השגיאה השכיחים שברצונך לראות: "))
# הצגת N קודי השגיאה השכיחים ביותר
most_common_errors = error_counter.most_common(N)
print(f"{N} קודי השגיאה השכיחים ביותר:")
for error, count in most_common_errors:
    print(f"{error}: {count}")


# סיבוכיות זמן הריצה והמקום:
#סיבוכיות זמן הריצה :
# היא o(n) לינארית מכיוון שיש לי לולאה שמחלקת את הקובץ לk קבצים והיא עוברת על כל השורות ( n שורות ) וכל 100000 שורות מכניסה לקובץ אבל עדיין עוברת על כל השורות
#בנוסף עבור כל קובץ קוראת את כל השורות שלו,כמות השורות בכל קובץ * כמות הקבצים = n ולכן עדיין נשאר סדר גודל של n ביחס למספר השורות
#סיבוכיות המקום :
#היא גם כן o(n) מכיוון שצריך לשמור את כל החלקים של הקובץ. אם הקובץ המקורי גדול, אז יהיו לנו הרבה קבצים קטנים, ולכן גם המקום שהם תופסים יהיה בהתאם