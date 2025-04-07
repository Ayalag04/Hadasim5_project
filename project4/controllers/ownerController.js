const OwnerModel = require("../models/ownerModel");

const OwnerController = {
  showLoginPage: (req, res) => {
    res.render("owner/login");
  },

  loginOwner: async (req, res) => {
    const { username, password } = req.body;

    if (username === "ayalagel" && password === "ag123") {
      req.session.owner = username;
      res.render("owner/dashboard", { owner: username });
    } else {
      res.send("שם משתמש או סיסמה שגויים");
    }
  },

  showOrderPage: async (req, res) => {
    try {
      const suppliers = await OwnerModel.getAllSuppliers();
      res.render("owner/orders", { suppliers });
    } catch (err) {
      console.error(err);
      res.send("שגיאה בטעינת הדף");
    }
  },

  getSupplierProducts: async (req, res) => {
    const { supplierId } = req.params;
    try {
      const products = await OwnerModel.getSupplierProducts(supplierId);
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "שגיאה בשליפת מוצרים" });
    }
  },

  placeOrder: async (req, res) => {
    const { supplierId, products, quantities, minQuantities } = req.body;
    try {
      await OwnerModel.placeOrder(
        supplierId,
        products,
        quantities,
        minQuantities
      );
      res.send("ההזמנה בוצעה בהצלחה!");
    } catch (err) {
      console.error(err);
      res.send("שגיאה בביצוע ההזמנה");
    }
  },

  showPendingOrdersPage: async (req, res) => {
    try {
      const orders = await OwnerModel.getPendingOrders();
      const suppliers = await OwnerModel.getAllSuppliers();
      res.render("owner/orders", { orders, suppliers });
    } catch (err) {
      console.error(err);
      res.send("שגיאה בטעינת ההזמנות הממתינות");
    }
  },

  viewAllOrders: async (req, res) => {
    if (!req.session.owner) return res.redirect("/owner/login");

    try {
      const orders = await OwnerModel.getAllOrders();
      res.render("owner/allOrders", { orders });
    } catch (err) {
      console.error("שגיאה בשליפת הזמנות:", err);
      res.status(500).send("שגיאה בטעינת ההזמנות");
    }
  },

  approveOrder: async (req, res) => {
    const { orderId } = req.params;
    try {
      await OwnerModel.approveOrder(orderId);
      res.redirect("/owner/orders");
    } catch (err) {
      console.error("שגיאה באישור ההזמנה:", err);
      res.status(500).send("שגיאה באישור ההזמנה");
    }
  },
};

module.exports = OwnerController;
