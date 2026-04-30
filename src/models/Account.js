const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    }, // unique = 1 account per customer
    accountNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    bankCode: { 
        type: String, 
        required: true 
    },
    bankName: { 
        type: String, 
        required: true 
    },
    balance: { 
        type: Number, 
        default: 15000 
    }, // pre-funded
  },
  { timestamps: true },
);

module.exports = mongoose.model("Account", accountSchema);
