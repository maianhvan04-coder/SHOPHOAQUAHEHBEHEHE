const { Schema, model } = require("mongoose")

const authProviderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    provider: {
        type: String,
        enum: ["local", "google", "facebook", "apple"],
        required: true,
    },

    // email (local) | google sub | facebook id | apple sub
    providerId: {
        type: String,
        required: true,
    },

    email: { type: String, trim: true },

    // chỉ local mới có
    passwordHash: { type: String, default: null },

    // reset password (local)
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },

}, { timestamps: true })

// 1 user không link cùng provider 2 lần
authProviderSchema.index(
    { userId: 1, provider: 1 },
    { unique: true }
)

// providerId là duy nhất trong provider
authProviderSchema.index(
    { provider: 1, providerId: 1 },
    { unique: true }
)

module.exports = model("AuthProvider", authProviderSchema)
