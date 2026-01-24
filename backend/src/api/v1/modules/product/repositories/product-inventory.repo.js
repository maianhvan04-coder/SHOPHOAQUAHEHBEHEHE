const ProductInventory = require("../models/product.inventory.model");

exports.create = (productId, data, session) => {
    return ProductInventory.create(
        [{ product: productId, ...data }],
        { session }
    );
};

exports.upsert = (productId, data, session) => {
    return ProductInventory.findOneAndUpdate(
        { product: productId },
        data,
        { upsert: true, new: true, session }
    );
};

exports.findByProductId = (productId) => ProductInventory.findOne({ product: productId }).lean()
