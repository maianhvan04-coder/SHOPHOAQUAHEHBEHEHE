const redisClient = require("../../../../config/redisClient");
const Product = require("../product/product.model");
require("dotenv").config()
module.exports.addProductToCart = async (userId, productId, quantity) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  });
  if (!product) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Sản phẩm không tồn tại hoặc đã bị ẩn"
    );
  }

  const cartKey = `cart:${userId}`;

  await redisClient.hIncrBy(cartKey, productId, parseInt(quantity));

  await redisClient.expire(cartKey, process.env.CART_EXPIRATION);

  return { productId, quantity };
};
module.exports.getCartDetails = async (userId) => {
  const cartKey = `cart:${userId}`;
  const rawCart = await redisClient.hGetAll(cartKey);

  if (!rawCart || Object.keys(rawCart).length === 0) {
    return { items: [],totalQuantity:0, totalAmount: 0 };
  }
  await redisClient.expire(cartKey, process.env.CART_EXPIRATION);
  const productIds = Object.keys(rawCart);
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "name price image slug"
  );

  let totalAmount = 0;
  let totalQuantity = 0;

  const items = products.map((product) => {
    const quantity = parseInt(rawCart[product._id.toString()]);
    const subTotal = product.price * quantity;
    totalAmount += subTotal;
    totalQuantity += quantity;
    return {
      product,
      quantity,
      subTotal,
    };
  });

  return { items, totalQuantity, totalAmount };
};
module.exports.updateQuantityCart = async (userId, productId, quantity) => {
  const cartKey = `cart:${userId}`;

  const exists = await redisClient.hExists(cartKey, productId);
  if (!exists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Sản phẩm không có trong giỏ hàng"
    );
  }

  if (parseInt(quantity) <= 0) {
    return await this.deleteFromCart(userId, productId);
  }

  await redisClient.hSet(cartKey, productId, parseInt(quantity));

  return { productId, quantity: parseInt(quantity) };
};
module.exports.deleteFromCart = async (userId, productId) => {
   
  const cartKey = `cart:${userId}`;

  await redisClient.hDel(cartKey, productId);

  return { productId, message: "Đã xóa sản phẩm khỏi giỏ hàng" };
};
