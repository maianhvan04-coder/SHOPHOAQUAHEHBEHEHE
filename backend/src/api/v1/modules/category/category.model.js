const { required } = require("joi");
const { Schema, model } = require("mongoose");

const categorySchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
})

module.exports = model("Category", categorySchema);