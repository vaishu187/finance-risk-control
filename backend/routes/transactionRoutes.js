const express = require("express");
const { createTransaction, getTransactions } = require("../controllers/transactionController");
const router = express.Router();

router.post("/transaction", createTransaction);
router.get("/transactions", getTransactions);

module.exports = router;
