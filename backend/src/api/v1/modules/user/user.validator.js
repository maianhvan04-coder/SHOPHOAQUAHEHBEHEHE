const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const addressSchema = Joi.object({
    name: Joi.string().trim().allow("").max(120),
    phone: Joi.string().trim().allow("").max(30),
    street: Joi.string().trim().allow("").max(255),
    ward: Joi.string().trim().allow("").max(120),
    district: Joi.string().trim().allow("").max(120),
    province: Joi.string().trim().allow("").max(120),
    isDefault: Joi.boolean(),
});

exports.idParam = Joi.object({
    id: objectId.required(),
});

/**
 * CREATE user (admin)
 * - Nhận password (plain) để controller hash -> passwordHash
 * - email/phone optional nhưng nếu có thì phải đúng format
 */
exports.create = Joi.object({
    fullName: Joi.string().trim().min(2).max(120).required(),
    email: Joi.string().trim().email().allow("", null),
    phone: Joi.string()
        .trim()
        .pattern(/^\d{10}$/)
        .messages({
            "string.pattern.base": "Số điện thoại phải đúng 10 chữ số.",
        })
        .allow("", null),

    password: Joi.string().min(6).max(72).required(),
    addresses: Joi.array().items(addressSchema).default([]),
    isActive: Joi.boolean().default(true),
    roleCodes: Joi.array().items(Joi.string().trim()).min(0).default([]),
})
    // Không cho client gửi passwordHash
    .unknown(false);

/**
 * UPDATE user
 * - không bắt buộc fields
 * - cho đổi password (nếu bạn muốn), controller hash lại
 */
exports.update = Joi.object({
    fullName: Joi.string().trim().min(2).max(120),
    email: Joi.string().trim().email().allow("", null),
    phone: Joi.string()
        .trim()
        .pattern(/^\d{10}$/)
        .messages({
            "string.pattern.base": "Số điện thoại phải đúng 10 chữ số.",
        })
        .allow("", null),

    password: Joi.string().min(6).max(72), // optional
    addresses: Joi.array().items(addressSchema),
    isActive: Joi.boolean(),
    roleCodes: Joi.array().items(Joi.string().trim()).min(0),
})
    .min(1) // phải có ít nhất 1 field để update
    .unknown(false);



exports.setUserRoles = Joi.object({
    roleCodes: Joi.array()
        .items(Joi.string().trim().uppercase())
        .min(1)
        .required(),
});
/**
 * CHANGE STATUS one user
 * PATCH /:id/status
 */
exports.changeStatus = Joi.object({
    isActive: Joi.boolean().required(),
}).unknown(false);

/**
 * BULK STATUS
 * PATCH /bulk/status
 * ✅ Fix: min(1) nằm ở array, không nằm trong items
 */
exports.bulkStatus = Joi.object({
    ids: Joi.array().items(objectId.required()).min(1).required(),
    isActive: Joi.boolean().required(),
}).unknown(false);

/**
 * BULK DELETE
 * PATCH /bulk/delete
 */
exports.bulkDelete = Joi.object({
    ids: Joi.array().items(objectId.required()).min(1).required(),
}).unknown(false);
