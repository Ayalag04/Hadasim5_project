const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const OwnerController = {
  // הצגת דף התחברות לבעלי המכולות
  showLoginPage: (req, res) => {
    res.render("owner/login");
  },

  // התחברות בעל המכולת
  loginOwner: async (req, res) => {
    const { username, password } = req.body;

    if (username === "ayalagel" && password === "ag123") {
      req.session.owner = username;
      res.render("owner/dashboard", { owner: username });
    } else {
      res.send("שם משתמש או סיסמה שגויים");
    }
  },

  // הצגת דף הזמנות להזמנה חדשה
  showOrderPage: async (req, res) => {
    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();
      const result = await request.query("SELECT * FROM suppliers");

      res.render("owner/orders", { suppliers: result.recordset });
    } catch (err) {
      console.error(err);
      res.send("שגיאה בטעינת הדף");
    } finally {
      sql.close();
    }
  },

  // שליפת מוצרים של ספק לפי ID
  getSupplierProducts: async (req, res) => {
    const { supplierId } = req.params;

    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();
      request.input("supplierId", sql.Int, supplierId);

      const result = await request.query(
        "SELECT * FROM products WHERE supplier_id = @supplierId"
      );

      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "שגיאה בשליפת מוצרים" });
    } finally {
      sql.close();
    }
  },

  // ביצוע הזמנה
  placeOrder: async (req, res) => {
    const { supplierId, products, quantities, minQuantities } = req.body;

    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();

      for (let productId in quantities) {
        const quantity = parseInt(quantities[productId]);
        const minQty = parseInt(minQuantities[productId]);

        if (!quantity || quantity < minQty) continue;

        const productName = req.body.products[productId];

        await request.query(
          `INSERT INTO orders (supplier_id, product_name, quantity, status, created_at)
           VALUES (${supplierId}, '${productName}', ${quantity}, N'Pending', GETDATE())`
        );
      }

      res.send("ההזמנה בוצעה בהצלחה!");
    } catch (err) {
      console.error(err);
      res.send("שגיאה בביצוע ההזמנה");
    } finally {
      sql.close();
    }
  },

  // הצגת הזמנות ממתינות לאישור
  showPendingOrdersPage: async (req, res) => {
    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();

      const result = await request.query(`
        SELECT orders.id, orders.status, orders.quantity,orders.created_at, suppliers.company_name AS supplier_name, orders.product_name 
        FROM orders 
        INNER JOIN suppliers ON orders.supplier_id = suppliers.id 
        WHERE orders.status = 'Pending'
      `);

      const supplierResult = await request.query("SELECT * FROM suppliers");

      res.render("owner/orders", {
        orders: result.recordset,
        suppliers: supplierResult.recordset,
      });
    } catch (err) {
      console.error(err);
      res.send("שגיאה בטעינת ההזמנות הממתינות");
    } finally {
      sql.close();
    }
  },

  // הצגת כל ההזמנות (לדף allOrders)
  viewAllOrders: async (req, res) => {
    if (!req.session.owner) return res.redirect("/owner/login");

    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();

      const result = await request.query(`
        SELECT * FROM orders ORDER BY created_at DESC
      `);

      res.render("owner/allOrders", { orders: result.recordset });
    } catch (err) {
      console.error("שגיאה בשליפת הזמנות:", err);
      res.status(500).send("שגיאה בטעינת ההזמנות");
    } finally {
      sql.close();
    }
  },

  // אישור הזמנה (מ Pending ל Completed)
  approveOrder: async (req, res) => {
    const { orderId } = req.params;

    try {
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();

      request.input("orderId", sql.Int, orderId);
      await request.query(
        "UPDATE orders SET status = 'Completed' WHERE id = @orderId"
      );

      // בעתיד – כאן אפשר להודיע לספק (נכון לעכשיו הוא רואה את זה אצל עצמו)
      res.redirect("/owner/orders");
    } catch (err) {
      console.error("שגיאה באישור ההזמנה:", err);
      res.status(500).send("שגיאה באישור ההזמנה");
    } finally {
      sql.close();
    }
  },
};

module.exports = OwnerController;
