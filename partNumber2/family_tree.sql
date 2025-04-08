CREATE TABLE Person (
    Person_Id INT PRIMARY KEY,  -- מפתח-תז של אדם
    Personal_Name VARCHAR(50),  
    Family_Name VARCHAR(50),
    Gender VARCHAR(10),         
    Father_Id INT,              -- תז של אבא שלו  
    Mother_Id INT,              -- תז של אמא שלו
    Spouse_Id INT
);

CREATE TABLE FamilyTree (
    Person_Id INT,
    Relative_Id INT,
    Connection_Type VARCHAR(20),
    PRIMARY KEY (Person_Id, Relative_Id, Connection_Type),  -- שלא קיימים 2 אנשים זהים עם בדיוק אותם קשרים   
    FOREIGN KEY (Person_Id) REFERENCES Person(Person_Id),   -- כדי לבדוק שהוא באמת מוגדר בטבלת האנשים  
    FOREIGN KEY (Relative_Id) REFERENCES Person(Person_Id)   -- כנל 
);

-- אני מכניסה נתונים אקראיים לאדם רק כדי שאוכל לבדוק 
INSERT INTO Person (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id, Spouse_Id)
VALUES
(1, 'משה', 'כהן', 'זכר', NULL, NULL, 2),
(2, 'לאה', 'כהן', 'נקבה', NULL, NULL, 1),
(3, 'יוסי', 'כהן', 'זכר', 1, 2, 4),
(4, 'רחל', 'כהן', 'נקבה', NULL, NULL, 3),
(5, 'דני', 'כהן', 'זכר', 3, 4, NULL),
(6, 'נועה', 'כהן', 'נקבה', 3, 4, NULL);


--חלק 1
--קשרים מדרגה ראשונה
--הוספת קשרי אב ואם 
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT Person_Id, Father_Id, 'אב'
FROM Person
WHERE Father_Id IS NOT NULL
UNION
SELECT Person_Id, Mother_Id, 'אם'
FROM Person
WHERE Mother_Id IS NOT NULL;

--הוספת קשרי בן ובת
INSERT INTO family_tree (Person_Id, Relative_Id, Connection_Type)
SELECT 
    IF(p.Gender = 'זכר', p.Father_Id, p.Mother_Id) AS Parent_Id,
    p.Person_Id,
    IF(p.Gender = 'זכר', 'בן', 'בת') AS Connection_Type
FROM persons p
WHERE (p.Father_Id IS NOT NULL OR p.Mother_Id IS NOT NULL);


--הוספת קשר בן/בת זוג 
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT Person_Id, Spouse_Id,
       CASE WHEN Gender = 'זכר' THEN 'בת זוג' ELSE 'בן זוג' END
FROM Person
WHERE Spouse_Id IS NOT NULL
  AND Gender = 'זכר';  -- או Gender = 'נקבה' בהתאם למי שאתה רוצה


--הוספת קשר של אח/ אחות 
-- אח
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT p1.Person_Id, p2.Person_Id, 'אח'
FROM Person p1
JOIN Person p2 ON p1.Person_Id <> p2.Person_Id
WHERE p1.Father_Id = p2.Father_Id
  AND p1.Mother_Id = p2.Mother_Id
  AND p2.Gender = 'זכר';

-- אחות
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT p1.Person_Id, p2.Person_Id, 'אחות'
FROM Person p1
JOIN Person p2 ON p1.Person_Id <> p2.Person_Id
WHERE p1.Father_Id = p2.Father_Id
  AND p1.Mother_Id = p2.Mother_Id
  AND p2.Gender = 'נקבה';


--חלק 2 INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT 
    f.Relative_Id, 
    f.Person_Id, 
    CASE 
        WHEN f.Connection_Type = 'בת זוג' THEN 'בן זוג'
        WHEN f.Connection_Type = 'בן זוג' THEN 'בת זוג'
    END
FROM FamilyTree f
JOIN Person p1 ON f.Person_Id = p1.Person_Id
JOIN Person p2 ON f.Relative_Id = p2.Person_Id
WHERE (f.Connection_Type = 'בת זוג' AND NOT EXISTS (
    SELECT 1 
    FROM FamilyTree f2 
    WHERE f2.Person_Id = f.Relative_Id 
      AND f2.Relative_Id = f.Person_Id 
      AND f2.Connection_Type = 'בן זוג'
))
OR (f.Connection_Type = 'בן זוג' AND NOT EXISTS (
    SELECT 1 
    FROM FamilyTree f2 
    WHERE f2.Person_Id = f.Relative_Id 
      AND f2.Relative_Id = f.Person_Id 
      AND f2.Connection_Type = 'בת זוג'
));
