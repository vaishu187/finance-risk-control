const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Create a new transaction
const createTransaction = async (req, res) => {
    try {
        const { userId, amount, transactionType, recipientId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Prevent withdrawals if insufficient balance
        if (transactionType === "withdrawal" && user.balance < amount) {
            return res.status(400).json({ error: "Insufficient funds for withdrawal" });
        }

        // Prevent large transactions >100000
        if (amount > 100000) {
            return res.status(400).json({ error: "Transaction exceeds allowed limit! Approval required." });
        }

        // Handle Transfers
        if (transactionType === "transfer") {
            const recipient = await User.findById(recipientId);
            if (!recipient) return res.status(404).json({ error: "Recipient not found" });

            if (user.balance < amount) {
                return res.status(400).json({ error: "Insufficient funds for transfer" });
            }

            recipient.balance += amount;
            await recipient.save();
        }

        // Process Transaction
        const transaction = new Transaction({ userId, amount, transactionType, recipientId });
        await transaction.save();

        // Update sender's balance
        if (transactionType !== "deposit") {
            user.balance -= amount;
        } else {
            user.balance += amount;
        }
        await user.save();

        res.status(201).json({ message: "Transaction successful", transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Transactions
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate("userId recipientId", "name email");
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTransaction, getTransactions };
