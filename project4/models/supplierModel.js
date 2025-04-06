const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

// פונקציה לבדוק אם ספק קיים במערכת
const findSupplierByPhone = (phone, callback) => {
  const query = "SELECT * FROM suppliers WHERE phone = ?";
  dbConfig.query(query, [phone], (err, result) => {
    if (err) {
      console.log("Error executing query:", err);
      return callback(err);
    }
    callback(null, result);
  });
};

// פונקציה להוסיף ספק חדש למערכת
const addNewSupplier = (supplierData, callback) => {
  const query =
    "INSERT INTO suppliers (company_name, supplier_name, phone) VALUES (?, ?, ?)";
  dbConfig.query(
    query,
    [supplierData.company_name, supplierData.supplier_name, supplierData.phone],
    (err, result) => {
      if (err) {
        console.log("Error executing query:", err);
        return callback(err);
      }
      callback(null, result);
    }
  );
};

module.exports = { findSupplierByPhone, addNewSupplier };
