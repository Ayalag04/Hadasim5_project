const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const SupplierModel = {
  //  בדיקה אם ספק קיים במערכת לפי מבפר טלפון והשם שלו
  findSupplierByPhoneAndName: (phone, supplier_name, callback) => {
    const query =
      "SELECT * FROM suppliers WHERE phone = @phone And supplier_name=@supplier_name";
    sql.connect(dbConfig.sqlConfig, (err) => {
      if (err) return callback(err);
      const request = new sql.Request();
      request.input("phone", sql.NVarChar, phone);
      request.input("supplier_name", sql.NVarChar, supplier_name);
      request.query(query, (err, result) => {
        if (err) return callback(err);
        callback(null, result.recordset);
      });
    });
  },

  // פונקציה להוסיף ספק חדש למערכת
  addNewSupplier: (supplierData, callback) => {
    const { company_name, supplier_name, phone } = supplierData;
    const query = `
      INSERT INTO suppliers (company_name, supplier_name, phone) 
      OUTPUT INSERTED.id 
      VALUES (@company_name, @supplier_name, @phone)
    `;
    sql.connect(dbConfig.sqlConfig, (err) => {
      if (err) return callback(err);
      const request = new sql.Request();
      request.input("company_name", sql.NVarChar, company_name);
      request.input("supplier_name", sql.NVarChar, supplier_name);
      request.input("phone", sql.NVarChar, phone);
      request.query(query, (err, result) => {
        if (err) return callback(err);
        callback(null, result.recordset[0]);
      });
    });
  },

  // פונקציה להוסיף מוצר עבור ספק
  addProductForSupplier: (supplierId, productName, price, minQuantity) => {
    const query = `
      INSERT INTO products (supplier_id, product_name, price_per_item, min_quantity) 
      VALUES (@supplierId, @productName, @price, @minQuantity)
    `;
    sql.connect(dbConfig.sqlConfig, (err) => {
      if (err) throw err;
      const request = new sql.Request();
      request.input("supplierId", sql.Int, supplierId);
      request.input("productName", sql.NVarChar, productName);
      request.input("price", sql.Float, price);
      request.input("minQuantity", sql.Int, minQuantity);
      request.query(query, (err) => {
        if (err) throw err;
      });
    });
  },

  // פונקציה לקבלת הזמנות של ספק
  getOrdersBySupplierId: (supplierId, status, callback) => {
    let query = "SELECT * FROM orders WHERE supplier_id = @supplierId";

    sql.connect(dbConfig.sqlConfig, (err) => {
      if (err) return callback(err);

      const request = new sql.Request();
      request.input("supplierId", sql.Int, supplierId);

      if (status) {
        query += " AND status = @status";
        request.input("status", sql.VarChar, status);
      }

      request.query(query, (err, result) => {
        if (err) return callback(err);
        callback(null, result.recordset);
      });
    });
  },

  // פונקציה לאישור הזמנה
  approveOrder: (orderId, callback) => {
    const query = "UPDATE orders SET status = 'In Process' WHERE id = @orderId";
    sql.connect(dbConfig.sqlConfig, (err) => {
      if (err) return callback(err);
      const request = new sql.Request();
      request.input("orderId", sql.Int, orderId);
      request.query(query, (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    });
  },
};

module.exports = SupplierModel;
