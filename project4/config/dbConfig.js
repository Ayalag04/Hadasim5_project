const sql = require("mssql");

const sqlConfig = {
  user: "Ayala_SQLLogin_1",
  password: "dao8uzcna2",
  database: "AyalaDB",
  server: "AyalaDB.mssql.somee.com",
  options: {
    encrypt: true, // חיבור מאובטח
    trustServerCertificate: true, // חובה ל-Somee
  },
  charset: "UTF8", // הוספת קידוד UTF-8
};

// פונקציה להתחברות למסד הנתונים
async function connectDB() {
  try {
    await sql.connect(sqlConfig);
    console.log("✅ התחברות מוצלחת למסד הנתונים!");
  } catch (error) {
    console.error("❌ שגיאה בחיבור למסד הנתונים:", error);
  }
}

module.exports = { sql, connectDB, sqlConfig };
