const { Schema, Types, model } = require("mongoose");

const schema = new Schema(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
        permissionId: { type: Types.ObjectId, ref: "Permission", required: true, index: true },
        effect: { type: String, enum: ["ALLOW", "DENY"], required: true },
    },
    { timestamps: true }
);

schema.index({ userId: 1, permissionId: 1 }, { unique: true });

module.exports = model("UserPermissionOverride", schema);
