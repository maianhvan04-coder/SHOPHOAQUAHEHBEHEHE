const { Schema, model } = require("mongoose");

const roleSchema = new Schema(
    {
        code: { type: String, required: true, unique: true, index: true }, // ADMIN, MANAGER...
        name: { type: String, default: "" },

        //dùng cho FE phân luồng (admin/user)
        type: {
            type: String,
            enum: ["owner", "manager", "staff", "shipper", "user"],
            default: "user",
            index: true,
        },

        //chọn role chính theo priority (cao hơn = mạnh hơn)
        priority: { type: Number, default: 0, index: true },

        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

module.exports = model("Role", roleSchema);
