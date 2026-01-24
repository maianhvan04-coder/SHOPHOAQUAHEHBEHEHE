// models/product/product.inventory.model.js
const mongoose = require("mongoose");

const productInventorySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            unique: true,
            index: true,
        },

        stock: { type: Number, default: 0, min: 0 },
        sold: { type: Number, default: 0 },

        lastRestockAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "ProductInventory",
    productInventorySchema
);
