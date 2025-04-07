const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const OwnerModel = {
  getAllSuppliers: async () => {
    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();
      const result = await request.query("SELECT * FROM suppliers");
      return result.recordset;
    } catch (err) {
      console.error("שגיאה בשליפת ספקים:", err);
      throw err;
    } finally {
      sql.close();
    }
  },

  getSupplierProducts: async (supplierId) => {
    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();
      request.input("supplierId", sql.Int, supplierId);
      const result = await request.query(
        "SELECT * FROM products WHERE supplier_id = @supplierId"
      );
      return result.recordset;
    } catch (err) {
      console.error("שגיאה בשליפת מוצרים:", err);
      throw err;
    } finally {
      sql.close();
    }
  },

  placeOrder: async (supplierId, products, quantities, minQuantities) => {
    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();

      for (let productId in quantities) {
        const quantity = parseInt(quantities[productId]);
        const minQty = parseInt(minQuantities[productId]);

        if (!quantity || quantity < minQty) continue;

        const productName = products[productId];

        await request.query(
          `INSERT INTO orders (supplier_id, product_name, quantity, status, created_at)
           VALUES (${supplierId}, '${productName}', ${quantity}, N'Pending', GETDATE())`
        );
      }
    } catch (err) {
      console.error("שגיאה בביצוע הזמנה:", err);
      throw err;
    } finally {
      sql.close();
    }
  },

  getPendingOrders: async () => {
    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();
      const result = await request.query(`
        SELECT orders.id, orders.status, orders.quantity, orders.created_at, suppliers.company_name AS supplier_name, orders.product_name 
        FROM orders 
        INNER JOIN suppliers ON orders.supplier_id = suppliers.id 
        WHERE orders.status = 'Pending'
      `);
      return result.recordset;
    } catch (err) {
      console.error("שגיאה בשליפת הזמנות ממתינות:", err);
      throw err;
    } finally {
      sql.close();
    }
  },

  getAllOrders: async () => {
    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();
      const result = await request.query(`
        SELECT * FROM orders ORDER BY created_at DESC
      `);
      return result.recordset;
    } catch (err) {
      console.error("שגיאה בשליפת כל ההזמנות:", err);
      throw err;
    } finally {
      sql.close();
    }
  },

  approveOrder: async (orderId) => {
    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();
      request.input("orderId", sql.Int, orderId);
      await request.query(
        "UPDATE orders SET status = 'Completed' WHERE id = @orderId"
      );
    } catch (err) {
      console.error("שגיאה באישור ההזמנה:", err);
      throw err;
    } finally {
      sql.close();
    }
  },
};

module.exports = OwnerModel;
