const Joi = require("joi");
const objectId = Joi.string().hex().length(24);

exports.setRolePermissions = Joi.object({
    roleCode: Joi.string().trim().required(),
    permissionKeys: Joi.array().items(Joi.string().trim()).default([]),
});

exports.setUserRoles = Joi.object({
    userId: objectId.required(),
    roleCodes: Joi.array().items(Joi.string().trim().required()).min(1).required(),
});

exports.setUserOverride = Joi.object({
    userId: objectId.required(),
    permissionKey: Joi.string().trim().required(),
    effect: Joi.string().valid("ALLOW", "DENY").required(),
});

exports.removeUserOverride = Joi.object({
    userId: objectId.required(),
    permissionKey: Joi.string().trim().required(),
});
