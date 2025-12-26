const Joi = require("joi");

const objectId = Joi.string().hex().length(24).messages({
    "string.hex": "ID phải là dạng hex",
    "string.length": "ID phải đủ 24 ký tự",
});

const imageItem = Joi.object({
    url: Joi.string().uri().required().messages({
        "any.required": "Ảnh: thiếu url",
        "string.uri": "Ảnh: url không hợp lệ",
    }),
    publicId: Joi.string().allow("").optional().messages({
        "string.base": "Ảnh: publicId phải là chuỗi",
    }),
});

exports.create = Joi.object({
    name: Joi.string().min(2).max(150).required().messages({
        "any.required": "Tên sản phẩm là bắt buộc",
        "string.base": "Tên sản phẩm phải là chuỗi",
        "string.min": "Tên sản phẩm tối thiểu {#limit} ký tự",
        "string.max": "Tên sản phẩm tối đa {#limit} ký tự",
    }),

    description: Joi.string().allow("").max(2000).optional().messages({
        "string.base": "Mô tả phải là chuỗi",
        "string.max": "Mô tả tối đa {#limit} ký tự",
    }),

    price: Joi.number().min(0).required().messages({
        "any.required": "Giá là bắt buộc",
        "number.base": "Giá phải là số",
        "number.min": "Giá phải >= {#limit}",
    }),

    stock: Joi.number().integer().min(0).optional().messages({
        "number.base": "Tồn kho phải là số",
        "number.integer": "Tồn kho phải là số nguyên",
        "number.min": "Tồn kho phải >= {#limit}",
    }),

    categoryId: objectId.required().messages({
        "any.required": "categoryId là bắt buộc",
    }),

    isActive: Joi.boolean().optional().messages({
        "boolean.base": "isActive phải là true/false",
    }),
    featuredRank: Joi.number().integer().min(0).max(100000).optional().messages({
        "number.base": "featuredRank phải là số",
        "number.integer": "featuredRank phải là số nguyên",
        "number.min": "featuredRank phải >= {#limit}",
        "number.max": "featuredRank phải <= {#limit}",
    }),
    images: Joi.array().items(imageItem).optional().messages({
        "array.base": "images phải là mảng",
    }),
}).messages({
    "object.unknown": "Có trường không được phép gửi lên",
});

exports.update = Joi.object({
    name: Joi.string().min(2).max(150).optional().messages({
        "string.base": "Tên sản phẩm phải là chuỗi",
        "string.min": "Tên sản phẩm tối thiểu {#limit} ký tự",
        "string.max": "Tên sản phẩm tối đa {#limit} ký tự",
    }),

    description: Joi.string().allow("").max(2000).optional().messages({
        "string.base": "Mô tả phải là chuỗi",
        "string.max": "Mô tả tối đa {#limit} ký tự",
    }),

    price: Joi.number().min(0).optional().messages({
        "number.base": "Giá phải là số",
        "number.min": "Giá phải >= {#limit}",
    }),

    stock: Joi.number().integer().min(0).optional().messages({
        "number.base": "Tồn kho phải là số",
        "number.integer": "Tồn kho phải là số nguyên",
        "number.min": "Tồn kho phải >= {#limit}",
    }),

    categoryId: objectId.optional(),

    isActive: Joi.boolean().optional().messages({
        "boolean.base": "isActive phải là true/false",
    }),

    isFeatured: Joi.boolean().optional().messages({
        "boolean.base": "isFeatured phải là true/false",
    }),

    featuredRank: Joi.number().integer().min(0).max(100000).optional().messages({
        "number.base": "featuredRank phải là số",
        "number.integer": "featuredRank phải là số nguyên",
        "number.min": "featuredRank phải >= {#limit}",
        "number.max": "featuredRank phải <= {#limit}",
    }),

    images: Joi.array().items(imageItem).optional().messages({
        "array.base": "images phải là mảng",
    }),
}).min(1).messages({
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
exports.setFeatured = Joi.object({
    isFeatured: Joi.boolean().required(),
    featuredRank: Joi.number().integer().min(0).max(100000).optional(),
});

exports.addImagesMeta = Joi.object({
    images: Joi.array().min(1).items(imageItem).required().messages({
        "any.required": "images là bắt buộc",
        "array.min": "Phải có ít nhất 1 ảnh",
    }),
});

exports.deleteImage = Joi.object({
    publicId: Joi.string().required().messages({
        "any.required": "Thiếu publicId",
    }),
});