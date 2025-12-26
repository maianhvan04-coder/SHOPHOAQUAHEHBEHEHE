const { Schema, model } = require("mongoose")
const schema = new Schema({
    key: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    group: { type: String, default: "GENERAL", index: true },
    isActive: { type: Boolean, default: true, index: true }
})

module.exports = model("Permission", schema)