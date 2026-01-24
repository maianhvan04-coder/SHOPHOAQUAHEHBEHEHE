const mongoose = require("mongoose");

const productDescriptionSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            unique: true,
            index: true,
        },

        templateType: { type: String, required: true },
        templateVersion: { type: Number, required: true },

        description: { type: String, default: "" },

        overrides: {
            type: Map,
            of: String,
            default: {},
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "ProductDescription",
    productDescriptionSchema
);
