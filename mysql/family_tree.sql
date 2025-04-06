CREATE TABLE FamilyTree (
    Person_Id INT,
    Relative_Id INT,
    Connection_Type VARCHAR(20),
    PRIMARY KEY (Person_Id, Relative_Id, Connection_Type)
);
