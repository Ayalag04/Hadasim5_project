const SupplierModel = require("../models/supplierModel");

const SupplierController = {
  // הצגת דף התחברות לספקים
  showLoginPage: (req, res) => {
    res.render("supplier/login");
  },

  // התחברות ספק
  login: async (req, res) => {
    const { supplier_name, phone } = req.body;

    try {
      // קבלת נתוני הספק מהמודל
      SupplierModel.findSupplierByPhoneAndName(
        phone,
        supplier_name,
        (err, result) => {
          if (err) {
            return res.status(500).send("שגיאה בהתחברות");
          }

          // אם לא נמצא ספק עם הנתונים שהוזנו
          if (result.length === 0) {
            return res.status(404).send(" ספק זה לא נמצא במערכת ");
          }

          const supplier = result[0];
          req.session.supplierId = supplier.id;
          return res.redirect("/supplier/orders");
        }
      );
    } catch (error) {
      console.error("שגיאה בהתחברות:", error);
      res.status(500).send("שגיאה בהתחברות");
    }
  },

  // הצגת דף הרשמה לספק
  showSignupPage: (req, res) => {
    res.render("supplier/signup");
  },

  //   טופס הרשמה לספק כולל רשימת המוצרים שלו
  signupSupplier: async (req, res) => {
    const { company_name, supplier_name, phone } = req.body;
    const productNames = req.body.productName || [];
    const prices = req.body.price || [];
    const minQuantities = req.body.minQuantity || [];

    try {
      // הוספת ספק חדש למערכת
      SupplierModel.addNewSupplier(
        { company_name, supplier_name, phone },
        (err, result) => {
          if (err) {
            return res.status(500).send("שגיאה בהרשמה");
          }

          const supplierId = result.insertId;

          // הוספת מוצרים לספק לאחר שמבצע הרשמה עם פרטיו
          productNames.forEach((productName, i) => {
            if (productName && prices[i] && minQuantities[i]) {
              SupplierModel.addProductForSupplier(
                supplierId,
                productName,
                prices[i],
                minQuantities[i]
              );
            }
          });

          // מפנה לדף התחברות
          res.redirect("/supplier/login");
        }
      );
    } catch (error) {
      console.error("שגיאה בהרשמה:", error);
      res.status(500).send("שגיאה בהרשמה");
    }
  },

  // הצגת הזמנות לספק שהתחבר
  getOrders: async (req, res) => {
    const supplierId = req.session.supplierId;
    if (!supplierId) {
      return res.redirect("/supplier/login");
    }

    const selectedStatus = req.query.status; // קבלת סינון מה-URL

    try {
      SupplierModel.getOrdersBySupplierId(
        supplierId,
        selectedStatus,                             //לפי סטטוס מסוים 
        (err, orders) => {
          if (err) {
            return res.status(500).send("שגיאה בהבאת הזמנות");
          }

          res.render("supplier/orders", {
            orders,
            selectedStatus: selectedStatus || "",
          });
        }
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("שגיאה בהבאת הזמנות");
    }
  },

  // אישור הזמנה עי הספק
  approveOrder: async (req, res) => {
    const orderId = req.params.id;

    try {
      SupplierModel.approveOrder(orderId, (err, result) => {
        if (err) {
          return res.status(500).send("שגיאה באישור הזמנה");
        }

        res.redirect("/supplier/orders");
      });
    } catch (error) {
      console.error("Error approving order:", error);
      res.status(500).send("שגיאה באישור הזמנה");
    }
  },
};

module.exports = SupplierController;
