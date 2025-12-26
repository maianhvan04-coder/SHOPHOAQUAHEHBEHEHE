
const { Schema, model, Types } = require("mongoose")



const schema = new Schema({
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    roleId: { type: Types.ObjectId, ref: "Role", index: true, required: true }
}, {
    timestamps: true
})
schema.index({ userId: 1, roleId: 1 }, { unique: true });
module.exports = model("UserRole", schema)
