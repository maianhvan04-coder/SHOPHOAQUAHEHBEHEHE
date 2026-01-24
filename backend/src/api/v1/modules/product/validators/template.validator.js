const Joi = require("joi");
const mongoose = require("mongoose");

/* ================= OBJECT ID ================= */
exports.objectId = Joi.string()
    .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    })
    .messages({
        "any.invalid": "ID không hợp lệ",
        "string.base": "ID phải là chuỗi",
        "string.empty": "ID không được để trống",
    });

/* ================= SECTION ================= */
const sectionSchema = Joi.object({
    key: Joi.string().required().messages({
        "any.required": "Section: thiếu key",
        "string.base": "Section.key phải là chuỗi",
        "string.empty": "Section.key không được để trống",
    }),

    title: Joi.string().required().messages({
        "any.required": "Section: thiếu title",
        "string.base": "Section.title phải là chuỗi",
        "string.empty": "Section.title không được để trống",
    }),

    content: Joi.string().required().messages({
        "any.required": "Section: thiếu content",
        "string.base": "Section.content phải là chuỗi",
        "string.empty": "Section.content không được để trống",
    }),
});

/* ================= CREATE TEMPLATE ================= */
exports.createTemplate = Joi.object({
    type: Joi.string().required().messages({
        "any.required": "type là bắt buộc",
        "string.base": "type phải là chuỗi",
        "string.empty": "type không được để trống",
    }),

    title: Joi.string().required().messages({
        "any.required": "title là bắt buộc",
        "string.base": "title phải là chuỗi",
        "string.empty": "title không được để trống",
    }),

    intro: Joi.string().required().messages({
        "any.required": "intro là bắt buộc",
        "string.base": "intro phải là chuỗi",
        "string.empty": "intro không được để trống",
    }),

    sections: Joi.array()
        .min(1)
        .items(sectionSchema)
        .required()
        .messages({
            "any.required": "sections là bắt buộc",
            "array.base": "sections phải là mảng",
            "array.min": "sections phải có ít nhất 1 section",
        }),
}).messages({
    "object.unknown": "Có trường không được phép gửi lên",
});

exports.activateVersion = Joi.object({
    type: Joi.string().required().messages({
        "any.required": "type là bắt buộc",
        "string.base": "type phải là chuỗi",
        "string.empty": "type không được để trống",
    }),
    version: Joi.number().integer().positive().required().messages({
        "any.required": "version là bắt buộc",
        "number.base": "version phải là số",
        "number.integer": "version phải là số nguyên",
        "number.positive": "version phải lớn hơn 0",
    }),
})
/* ================= CREATE VERSION ================= */
exports.createVersion = Joi.object({
    title: Joi.string().required().messages({
        "any.required": "title là bắt buộc",
        "string.base": "title phải là chuỗi",
        "string.empty": "title không được để trống",
    }),

    intro: Joi.string().required().messages({
        "any.required": "intro là bắt buộc",
        "string.base": "intro phải là chuỗi",
        "string.empty": "intro không được để trống",
    }),
}).messages({
    "object.unknown": "Có trường không được phép gửi lên",
});
