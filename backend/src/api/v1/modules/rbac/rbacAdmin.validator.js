const Joi = require("joi");
const objectId = Joi.string().hex().length(24);
const ROLE_TYPES = ["owner", "manager", "staff", "shipper", "user"];
// 
const code = Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_]+$/)
    .min(2)
    .max(50)
    .required()
    .messages({
        "string.pattern.base": "code chỉ gồm A-Z, 0-9 và dấu _",
    })

const name = Joi.string().trim().max(120).allow("").default("");
const description = Joi.string().trim().max(500).allow("").default("");
const priority = Joi.number().integer().min(0).max(9999).default(0);
const isActive = Joi.boolean().default(true);
const isDeleted = Joi.boolean().default(false);

const type = Joi.string()
    .valid(...ROLE_TYPES)
    .default("user");
exports.setRolePermissions = Joi.object({
    roleCode: Joi.string().trim().required(),

    permissionKeys: Joi.array()
        .items(
            Joi.object({
                key: Joi.string().trim().required(),
                scope: Joi.string()
                    .valid("all", "own", "department", "organization")
                    .required(),
                field: Joi.string().allow(null),
            })
        )
        .min(1)      // 👈 có ít nhất 1 permission
        .required(), // 👈 BẮT BUỘC
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

exports.createRole = Joi.object({
    code,
    name,
    description,
    type,
    priority,
    isActive,
    isDeleted,

});



exports.updateRoleSchema = Joi.object({
    code,
    name,
    description,
    type,
    priority,
    isActive,
    isDeleted,
})
    .min(1) // phải có ít nhất 1 field để update
    .required();


