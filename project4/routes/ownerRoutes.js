const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");

router.get("/login", ownerController.showLoginPage);
router.post("/login", ownerController.loginOwner);

// Route לדף ה-dashboard לאחר התחברות מוצלחת
router.get("/dashboard", (req, res) => {
  // אם המשתמש לא מחובר, נחזיר אותו לדף ההתחברות
  if (!req.session.owner) {
    return res.redirect("/owner/login");
  }
  // אחרת, מציגים את דף ה-dashboard
  res.render("owner/dashboard", { owner: req.session.owner });
});

router.get("/place-order", ownerController.showOrderPage);
router.get("/products/:supplierId", ownerController.getSupplierProducts);
router.post("/place-order", ownerController.placeOrder);

// הצגת כל ההזמנות
router.get("/orders", ownerController.viewAllOrders);

// אישור הזמנה
router.post("/orders/approve/:orderId", ownerController.approveOrder);

module.exports = router;
