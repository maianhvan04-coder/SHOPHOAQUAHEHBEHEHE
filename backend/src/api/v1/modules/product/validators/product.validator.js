const Joi = require("joi");

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        "string.pattern.base": "ID không hợp lệ",
    });



const imageSchema = Joi.object({
    url: Joi.string()
        .uri()
        .required()
        .messages({
            "any.required": "Thiếu url ảnh",
            "string.uri": "url ảnh không hợp lệ",
        }),

    publicId: Joi.string()
        .required()
        .messages({
            "any.required": "Thiếu publicId ảnh",
        }),

    width: Joi.number().integer().positive().optional(),
    height: Joi.number().integer().positive().optional(),

    order: Joi.number().integer().min(0).default(0),
    isPrimary: Joi.boolean().default(false),
});


const descriptionSchema = Joi.object({
    templateType: Joi.string().required().messages({
        "any.required": "Thiếu loại template mô tả",
    }),

    templateVersion: Joi.number().integer().min(1).required().messages({
        "any.required": "Thiếu version template",
        "number.base": "templateVersion phải là số",
    }),

    description: Joi.string().allow("").default("").messages({
        "string.base": "Giới thiệu phải là chuỗi",
    }),

    overrides: Joi.object()
        .pattern(Joi.string(), Joi.string().allow(""))
        .default({})
        .messages({
            "object.base": "overrides phải là object",
        }),
});



exports.create = Joi.object({
    name: Joi.string().min(2).max(150).required().messages({
        "any.required": "Tên sản phẩm là bắt buộc",
    }),

    category: objectId.required().messages({
        "any.required": "Danh mục là bắt buộc",
    }),

    price: Joi.number().min(0).required().messages({
        "any.required": "Giá là bắt buộc",
        "number.min": "Giá phải >= 0",
    }),

    inventory: Joi.object({
        stock: Joi.number().integer().min(0).required().messages({
            "any.required": "Tồn kho là bắt buộc",
            "number.min": "Tồn kho phải >= 0",
        }),
    }).required(),

    description: descriptionSchema.required(),

    images: Joi.array().min(1).items(imageSchema).required().messages({
        "array.min": "Phải có ít nhất 1 ảnh",
    }),

    isFeatured: Joi.boolean().optional(),
    featuredRank: Joi.number().integer().min(0).max(100000).optional(),

    image: Joi.any().strip(), // không cho client gửi
}).messages({
    "object.unknown": "Có trường không được phép gửi lên",
});



exports.update = Joi.object({
    name: Joi.string().min(2).max(150).optional(),

    categoryId: objectId.optional(),

    price: Joi.number().min(0).optional(),

    inventory: Joi.object({
        stock: Joi.number().integer().min(0).optional(),
    }).optional(),

    description: descriptionSchema.optional(),

    images: Joi.array().items(imageSchema).optional(),

    isActive: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),
    featuredRank: Joi.number().integer().min(0).max(100000).optional(),
})
    .min(1)
    .messages({
        "object.min": "Bạn phải gửi ít nhất 1 trường để cập nhật",
        "object.unknown": "Có trường không được phép gửi lên",
    });


exports.setFeatured = Joi.object({
    isFeatured: Joi.boolean().required().messages({
        "any.required": "isFeatured là bắt buộc",
        "boolean.base": "isFeatured phải là true/false",
    }),
    featuredRank: Joi.number().integer().min(0).max(100000).optional().messages({
        "number.base": "featuredRank phải là số",
        "number.integer": "featuredRank phải là số nguyên",
        "number.min": "featuredRank phải >= {#limit}",
        "number.max": "featuredRank phải <= {#limit}",
    }),
}).messages({
    "object.unknown": "Có trường không được phép gửi lên",
});

exports.changeStatus = Joi.object({
    isActive: Joi.boolean().required().messages({
        "any.required": "isActive là bắt buộc",
        "boolean.base": "isActive phải là true/false",
    }),
}).messages({
    "object.unknown": "Có trường không được phép gửi lên",
});


exports.addImagesMeta = Joi.object({
    images: Joi.array().min(1).items(imageSchema).required().messages({
        "any.required": "images là bắt buộc",
        "array.min": "Phải có ít nhất 1 ảnh",
    }),
});

exports.deleteImage = Joi.object({
    publicId: Joi.string().required().messages({
        "any.required": "Thiếu publicId",
    }),
});