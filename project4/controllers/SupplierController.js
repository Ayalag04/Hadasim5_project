const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const SupplierController = {
  // הצגת דף התחברות לספקים
  showLoginPage: (req, res) => {
    res.render("supplier/login");
  },

  // התחברות ספק
  login: async (req, res) => {
    const { supplier_name, phone } = req.body; // נתוני הספק שהוזנו
    console.log(`Supplier Name: ${supplier_name}, Phone: ${phone}`); // הדפסה לבדוק את הערכים שהוזנו

    try {
      // חיבור למסד הנתונים
      await sql.connect(dbConfig.sqlConfig);

      // יצירת בקשת SQL
      const request = new sql.Request();
      request.input("supplier_name", sql.NVarChar, supplier_name);
      request.input("phone", sql.NVarChar, phone);

      // ביצוע השאילתה
      const result = await request.query(
        "SELECT * FROM suppliers WHERE supplier_name = @supplier_name AND phone = @phone"
      );

      console.log(result.recordset); // הדפסה של התוצאה שהתקבלה

      // אם לא מצאנו ספק עם הנתונים שהוזנו
      if (result.recordset.length === 0) {
        return res.status(404).send("ספק לא נמצא");
      }

      const supplier = result.recordset[0]; // לוקחים את הספק הראשון שמצאנו

      // שומרים את ה-ID של הספק ב-session כדי לזהות אותו בהמשך
      req.session.supplierId = supplier.id;

      // אם הספק נמצא, מעבירים אותו לדף ההזמנות
      return res.redirect("/supplier/orders");
    } catch (error) {
      console.error("שגיאה בהתחברות:", error);
      res.status(500).send("שגיאה בהתחברות");
    } finally {
      // סוגרים את החיבור למסד הנתונים לאחר סיום
      sql.close();
    }
  },

  // הצגת דף הרשמה לספק
  showSignupPage: (req, res) => {
    res.render("supplier/signup");
  },

  // טיפול בהגשת טופס הרשמה
  signupSupplier: async (req, res) => {
    const { company_name, supplier_name, phone } = req.body; // נתוני הספק
    const productNames = req.body.productName || [];
    const prices = req.body.price || [];
    const minQuantities = req.body.minQuantity || [];

    try {
      // חיבור למסד הנתונים
      await sql.connect(dbConfig.sqlConfig);
      const request = new sql.Request();

      // הכנסת הספק לטבלה suppliers
      request.input("company_name", sql.NVarChar, company_name);
      request.input("supplier_name", sql.NVarChar, supplier_name);
      request.input("phone", sql.NVarChar, phone);

      // ביצוע השאילתה להוספת ספק חדש
      const result = await request.query(`
        INSERT INTO suppliers (company_name, supplier_name, phone) 
        OUTPUT INSERTED.id 
        VALUES (@company_name, @supplier_name, @phone)
      `);

      // קבלת ה-ID של הספק שנוסף
      const supplierId = result.recordset[0].id;

      // הוספת המוצרים לטבלת Products
      for (let i = 0; i < productNames.length; i++) {
        if (productNames[i] && prices[i] && minQuantities[i]) {
          const requestProduct = new sql.Request();
          requestProduct.input("supplierId", sql.Int, supplierId);
          requestProduct.input("productName", sql.NVarChar, productNames[i]);
          requestProduct.input("price", sql.Float, prices[i]);
          requestProduct.input("minQuantity", sql.Int, minQuantities[i]);

          // ביצוע השאילתה להוספת מוצר חדש
          await requestProduct.query(`
            INSERT INTO products (supplier_id, product_name, price_per_item, min_quantity) 
            VALUES (@supplierId, @productName, @price, @minQuantity)
          `);
        }
      }

      // הפניה לדף התחברות לאחר סיום ההרשמה
      res.redirect("/supplier/login");
    } catch (error) {
      console.error("שגיאה בהרשמה:", error);
      res.status(500).send("שגיאה בהרשמה");
    } finally {
      // סוגרים את החיבור למסד הנתונים לאחר סיום
      sql.close();
    }
  },

  // הצגת הזמנות ספק
  getOrders: async (req, res) => {
    try {
      const supplierId = req.session.supplierId; // שמירת ה-ID של הספק ב-session
      if (!supplierId) {
        return res.redirect("/supplier/login"); // אם הספק לא מחובר, מחזירים אותו לדף התחברות
      }

      if (!req.session) {
        return res.status(500).send("שגיאה עם ה-session");
      }

      // חיבור למסד הנתונים
      await sql.connect(dbConfig.sqlConfig);

      // ביצוע שאילתת SQL לקבלת הזמנות של ספק מסויים
      const request = new sql.Request();
      request.input("supplier_id", sql.Int, supplierId);

      const result = await request.query(`
        SELECT * FROM orders WHERE supplier_id = @supplier_id
      `);

      res.render("supplier/orders", { orders: result.recordset });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("שגיאה בהבאת הזמנות");
    } finally {
      // סוגרים את החיבור למסד הנתונים לאחר סיום
      sql.close();
    }
  },

  // אישור הזמנה
  approveOrder: async (req, res) => {
    const orderId = req.params.id;

    try {
      // חיבור למסד הנתונים
      await sql.connect(dbConfig.sqlConfig);

      // עדכון הסטטוס של הזמנה
      const request = new sql.Request();
      request.input("orderId", sql.Int, orderId);

      await request.query(`
        UPDATE orders SET status = 'In Process' WHERE id = @orderId
      `);

      res.redirect("/supplier/orders");
    } catch (error) {
      console.error("Error approving order:", error);
      res.status(500).send("שגיאה באישור הזמנה");
    } finally {
      // סוגרים את החיבור למסד הנתונים לאחר סיום
      sql.close();
    }
  },
};

module.exports = SupplierController;
