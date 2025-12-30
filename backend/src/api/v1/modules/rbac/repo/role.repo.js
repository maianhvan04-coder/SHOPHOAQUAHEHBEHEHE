
// repo/role.repo.js
const Role = require("../model/role.model");

exports.findByCodeLean = (code) => Role.findOne({ code }).lean();

exports.findById = (id) => Role.findById(id);

exports.create = (payload) => Role.create(payload);

exports.deleteById = (id) =>
    Role.updateOne(
        { _id: id },
        { $set: { isDeleted: true } }
    );


exports.existsByCode = async (code) => {
    const doc = await Role.findOne({ code }).select("_id").lean();
    return !!doc;
};

exports.existsByCodeExceptId = async (code, id) => {
    const doc = await Role.findOne({ code, _id: { $ne: id } }).select("_id").lean();
    return !!doc;
};