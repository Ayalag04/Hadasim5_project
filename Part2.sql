CREATE TABLE FamilyTree ( --יצירת טבלה של עץ משפחה 
    Person_Id INT,
    Relative_Id INT,
    Connection_Type VARCHAR(15),
    PRIMARY KEY (Person_Id, Relative_Id),
    FOREIGN KEY (Person_Id) REFERENCES Persons(Person_Id),
    FOREIGN KEY (Relative_Id) REFERENCES Persons(Person_Id)
);

--תרגיל 2 
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)  --בדיקת התאמה בין בני זוג 
SELECT Relative_Id, Person_Id, 'בן זוג'
FROM FamilyTree AS ft
WHERE ft.Connection_Type = 'בת זוג'
AND NOT EXISTS ( --שלא יהיה חזרות 
    SELECT 1
    FROM FamilyTree AS ft2
    WHERE ft2.Person_Id = ft.Relative_Id
    AND ft2.Relative_Id = ft.Person_Id
    AND ft2.Connection_Type = 'בן זוג'
);


