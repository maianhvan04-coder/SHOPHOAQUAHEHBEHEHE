const { Schema, model } = require("mongoose")

const addressSchema = new Schema({
    name: String,
    phone: String,
    street: String,
    ward: String,
    district: String,
    province: String,
    isDefault: { type: Boolean, default: false },
}, { _id: false })

const userSchema = new Schema({
    fullName: { type: String, trim: true },

    email: { type: String, trim: true, unique: true, sparse: true },
    phone: { type: String, trim: true, unique: true, sparse: true },

    image: {
        url: { type: String, trim: true, default: "" },
        publicId: { type: String, trim: true, default: "" },
    },

    // PHÂN LOẠI USER (business)
    type: {
        type: String,
        enum: ["internal", "client"],
        default: "client",
        index: true,
    },

    addresses: [addressSchema],

    authzVersion: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

}, { timestamps: true })

module.exports = model("User", userSchema)
