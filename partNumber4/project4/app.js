const express = require("express");
const app = express();
const db = require("./config/dbConfig"); // ייבוא החיבור למסד הנתונים
const session = require("express-session"); // ייבוא של middleware של session

// הגדרת ה-session
app.use(
  session({
    secret: "your-secret-key", // מפתח סודי לשמירה על ה-session
    resave: false, // האם לשמור את ה-session בכל בקשה
    saveUninitialized: true, // האם לשמור את ה-session גם אם לא נוצרו נתונים עדיין
    cookie: { secure: false }, // אם אתה לא עובד עם HTTPS, set secure to false
  })
);
// הגדרת EJS
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// הגדרת הרוטים
const indexRouter = require("./routes/index");
const supplierRoutes = require("./routes/supplierRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

app.use("/", indexRouter);
app.use("/supplier", supplierRoutes);
app.use("/owner", ownerRoutes);

// שמירה על פורט ההרצה
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
