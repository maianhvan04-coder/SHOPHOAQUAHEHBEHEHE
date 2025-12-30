const { Schema, model, Types } = require("mongoose");

const schema = new Schema(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
        roleId: { type: Types.ObjectId, ref: "Role", required: true, index: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// unique chỉ nên áp dụng cho các bản ghi chưa bị xóa mềm
schema.index(
    { userId: 1, roleId: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = model("UserRole", schema);
