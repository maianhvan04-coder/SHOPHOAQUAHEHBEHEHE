// models/product/product.rating.model.js
const mongoose = require("mongoose");

const productRatingSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            unique: true,
            index: true,
        },

        avgRating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProductRating", productRatingSchema);
