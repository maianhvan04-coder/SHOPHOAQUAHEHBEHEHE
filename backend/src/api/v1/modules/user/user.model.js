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

    // local auth
    passwordHash: { type: String, default: null },

    // social auth
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    googleId: { type: String, unique: true, sparse: true },

    authzVersion: { type: Number, default: 0 },

    //  reset password (chỉ local)
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },

    image: {
        url: { type: String, trim: true, default: "" },
        publicId: { type: String, trim: true, default: "" },
    },

    //PHÂN LOẠI USER
    type: {
        type: String,
        enum: ["internal", "client"],
        default: "client", // user đăng ký bình thường
        index: true,
    },
    addresses: [addressSchema],

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

}, { timestamps: true })

module.exports = model("User", userSchema)
