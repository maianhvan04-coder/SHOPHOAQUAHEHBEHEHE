// models/product/product.image.model.js
const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            index: true,
        },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        width: Number,
        height: Number,

        alt: { type: String },
        title: { type: String },
        order: { type: Number, default: 0 },
        isPrimary: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProductImage", productImageSchema);
