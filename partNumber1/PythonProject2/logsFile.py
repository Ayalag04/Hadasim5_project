#חלוקת הקובץ לתתי קבצים
import pandas as pd #קורא קבצי אקסל
from collections import Counter
import glob
import os  #  os לניהול תיקיות

# יצירת תיקייה לשמירת תתי הקבצים
outputFiles = "log_chunks"  
os.makedirs(outputFiles, exist_ok=True)  # תיצור אותה רק אם היא לא קיימת 

# קריאת הקובץ
filePath = "logs.txt.xlsx"
df = pd.read_excel(filePath, header=None) # שלא יהיו כותורות בקובץ
df.columns = ["log"] #שם חדש לעמודה
df["error_codes"] = df["log"].str.extract(r'Error:\s(\w+_\d+)')


chunkSize = 100000  # מספר השורות בכל קובץ לאחר החלוקה 
numOfchunks = len(df) // chunkSize + 1  # לכמה חלקים חילקתי סהכ את הקובץ שלי 

# שמירת כל חלק מהקובץ בקובץ נפרד
for i in range(numOfchunks): #עובר על החלקים
    startOfRow = i * chunkSize
    endOfRow = startOfRow + chunkSize
    chunk = df.iloc[startOfRow:endOfRow]  # קבלת החלק לפי טווח השורות לדוגמא בין 100000-200000
    chunk.to_csv(os.path.join(outputFiles, f'logs_part_{i + 1}.csv'), index=False)  # שמירת כל חלק כקובץ CSV בתיקייה

print(f"Saved {numOfchunks} chunks.")


# חישוב שכיחות קודי השגיאה עבור כל חלק
chunkFiles = glob.glob('log_chunks/logs_part_*.csv')
errorInCounter = Counter()  #  לספור את מספר השגיאות 

for file in chunkFiles: 
    chunkDierctFile= pd.read_csv(file)  # קריאת הקובץ הנוכחי
    error_codes = chunkDierctFile['error_codes'].dropna()  # חיפוש קודי השגיאה
    errorInCounter.update(error_codes)  #  עדכון הספירה
    #update מבצע צבירה של הערכים שה counter סוכם

N = int(input(" הזן את מספר קודי השגיאה השכיחים שאתה רוצה לראות: ")) # N מספר קודי השגיאה
mostCommonErrors = errorInCounter.most_common(N)
print(f"{N} קודי השגיאה השכיחים ביותר:")
for error, count in mostCommonErrors:
    print(f"{error}: {count}")

#(הוספתי את זה גם בקובץ txt )
# סיבוכיות זמן הריצה והמקום:
#סיבוכיות זמן הריצה :
# היא o(n) לינארית מכיוון שיש לי לולאה שמחלקת את הקובץ לk קבצים והיא עוברת על כל השורות ( n שורות ) וכל 100000 שורות מכניסה לקובץ אבל עדיין עוברת על כל השורות
#בנוסף עבור כל קובץ קוראת את כל השורות שלו,כמות השורות בכל קובץ * כמות הקבצים = n ולכן עדיין נשאר סדר גודל של n ביחס למספר השורות
#סיבוכיות המקום :
#היא גם כן o(n) מכיוון שצריך לשמור את כל החלקים של הקובץ. אם הקובץ המקורי גדול, אז יהיו לנו הרבה קבצים קטנים, ולכן גם המקום שהם תופסים יהיה בהתאם