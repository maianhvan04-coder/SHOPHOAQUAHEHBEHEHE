const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
    {
        key: String,
        title: String,
        content: String,
    },
    { _id: false }
);

const templateVersionSchema = new mongoose.Schema(
    {
        version: { type: Number, required: true }, // v1, v2...
        title: { type: String, required: true },
        intro: { type: String, required: true },
        sections: { type: [sectionSchema], default: [] },
        createdBy: { type: mongoose.Schema.ObjectId, ref: "User" },
        updatedBy: { type: mongoose.Schema.ObjectId, ref: "User" },

        createdAt: { type: Date, default: Date.now },
        isDeleted: { type: Boolean, default: false }
    },
    { _id: false }
);

const productDescriptionTemplateSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        versions: {
            type: [templateVersionSchema],
            default: [],
        },

        activeVersion: {
            type: Number,
            required: true,
            default: 1,
        },
        versionCounter: {
            type: Number,
            default: 1,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "ProductDescriptionTemplate",
    productDescriptionTemplateSchema
);
