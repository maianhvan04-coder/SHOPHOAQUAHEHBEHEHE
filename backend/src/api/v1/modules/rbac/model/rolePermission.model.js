
const { Schema, model, Types } = require("mongoose")


const schema = new Schema({
    roleId: { type: Types.ObjectId, ref: "Role", required: true, index: true },
    // permissionId: { type: Types.ObjectId, ref: "Permission", index: true, required: true },
    permissionKey: {
        type: String,
        required: true,
        index: true,
    },
    scope: {
        type: String,
        enum: ["all", "own", "department", "organization"],

        default: "all",
    },


    field: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})
schema.index({ roleId: 1, permissionKey: 1 }, { unique: true });
module.exports = model("RolePermission", schema)
