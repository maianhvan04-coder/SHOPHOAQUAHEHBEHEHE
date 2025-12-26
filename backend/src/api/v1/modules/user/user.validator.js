const Joi = require("joi")
exports.bulkStatus = Joi.object({
    ids: Joi.array().items(Joi.string().hex().length(24).required().min(1).required()),
    isActive: Joi.boolean().required(),
})

exports.bulkDelete = Joi.object({
    ids: Joi.array().items(Joi.string().hex().length(24).required()).min(1).required(),
});