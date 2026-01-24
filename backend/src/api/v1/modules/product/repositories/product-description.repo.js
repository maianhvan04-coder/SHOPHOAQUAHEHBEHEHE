const ProductDescription = require("../models/product.description.model");
const {
    sanitizeEditorHtml,
    sanitizeOverrides,
} = require("../../../../../helpers/sanitizeDescriptionHtml.js");
exports.upsert = (productId, data, session) => {
    console.log("TYPE PRODUCT", data)
    return ProductDescription.findOneAndUpdate(
        { product: productId },
        {
            product: productId,
            templateType: data.templateType,
            templateVersion: data.templateVersion,
            description: sanitizeEditorHtml(data.description),
            overrides: sanitizeOverrides(data.overrides),
        },
        {
            upsert: true,
            new: true,
            session,
            setDefaultsOnInsert: true,
        }
    );
};

exports.findByProductId = (productId) => ProductDescription.findOne({ product: productId }).lean()
