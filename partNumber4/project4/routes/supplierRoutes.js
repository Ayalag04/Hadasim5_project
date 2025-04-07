const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/SupplierController");

//כניסת ספק למערכת
router.get("/login", supplierController.showLoginPage);
router.post("/login", supplierController.login);

// הרשמת ספק למערכת
router.get("/signup", supplierController.showSignupPage);
router.post("/signup", supplierController.signupSupplier);

//רשימת הזמנות
router.get("/orders", supplierController.getOrders);
router.post("/orders/:id/approve", supplierController.approveOrder);

module.exports = router;
