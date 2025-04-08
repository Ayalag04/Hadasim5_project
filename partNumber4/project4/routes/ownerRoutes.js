const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");
const { getOrdersBySupplierId } = require("../models/supplierModel");

//הרשמת בעל מכולת
router.get("/login", ownerController.showLoginPage);
router.post("/login", ownerController.loginOwner);

//אם התחבר בהצלחה
router.get("/dashboard", (req, res) => {
  //אם לא מחובר יחזור לדף ההתחברות
  if (!req.session.owner) {
    return res.redirect("/owner/login");
  }
  //אחרת-אם יתחבר, מציגים את דף הבא
  res.render("owner/dashboard", { owner: req.session.owner });
});

router.get("/place-order", ownerController.showOrderPage);
router.get("/products/:supplierId", ownerController.getSupplierProducts);
router.post("/place-order", ownerController.placeOrder);

// הצגת כל ההזמנות
router.get("/orders", ownerController.viewAllOrders);

// אישור הזמנה
router.post("/orders/approve/:orderId", ownerController.approveOrder);

router.get("/", ownerController.getout);

module.exports = router;
