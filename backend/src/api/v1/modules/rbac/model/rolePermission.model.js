
const { Schema, model, Types } = require("mongoose")


const schema = new Schema({
    roleId: { type: Types.ObjectId, ref: "Role", required: true, index: true },
    permissionId: { type: Types.ObjectId, ref: "Permission", index: true, required: true }
}, {
    timestamps: true
})
schema.index({ roleId: 1, permissionId: 1 }, { unique: true });
module.exports = model("RolePermission", schema)
