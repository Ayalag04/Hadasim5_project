const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/SupplierController");

// Route לכניסת ספק
router.get("/login", supplierController.showLoginPage);
router.post("/login", supplierController.login);

// Route להרשמת ספק
router.get("/signup", supplierController.showSignupPage);
router.post("/signup", supplierController.signupSupplier);

router.get("/orders", supplierController.getOrders);
router.post("/orders/:id/approve", supplierController.approveOrder);

module.exports = router;
