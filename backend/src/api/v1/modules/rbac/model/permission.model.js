const { Schema, model } = require("mongoose");

const permissionSchema = new Schema(
    {
        key: { type: String, required: true, unique: true, index: true }, // user:view
        resource: { type: String, required: true, index: true },          // user
        action: { type: String, required: true, index: true },            // view/create/update/delete/export

        label: { type: String, default: "", trim: true },                 // tiếng Việt
        groupKey: { type: String, default: "", index: true },             // USERS/ROLES/REPORTS
        groupLabel: { type: String, default: "", trim: true },            // "Quản lý người dùng"
        order: { type: Number, default: 0, index: true },

        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

module.exports = model("Permission", permissionSchema);
