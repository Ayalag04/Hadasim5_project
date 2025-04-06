const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/SupplierController"); // ייבוא ה-controller

// דף הכניסה הראשי עם שני כפתורים
router.get("/", (req, res) => {
  res.render("index");
});

// קריאה לפונקציה login מתוך ה-controller
router.post("/supplier-dashboard", supplierController.login);

module.exports = router;
