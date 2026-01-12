const Cart = require("./cart.model");

module.exports.addToCartService = async (
  userId,
  { productId, quantity, price }
) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    return await Cart.create({
      userId,
      items: [{ productId, quantity, price }],
    });
  }

  const itemIndex = cart.items.findIndex(
    (p) => p.productId.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
    cart.items[itemIndex].price = price;
  } else {
    cart.items.push({ productId, quantity, price });
  }

  return await cart.save();
};

module.exports.updateQuantityService = async (
  userId,
  { productId, quantity }
) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Giỏ hàng không tồn tại");

  const itemIndex = cart.items.findIndex(
    (p) => p.productId.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    return await cart.save();
  }
  throw new Error("Sản phẩm không có trong giỏ");
};

module.exports.removeItemService = async (userId, productId) => {
  return await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId } } },
    { new: true }
  );
};

module.exports.getFullCartService = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "name image price",
  });

  if (!cart) return { items: [], totalQuantity: 0, totalAmount: 0 };

  const totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cart.items.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0
  );

  return {
    items: cart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
      subTotal: item.quantity * item.price,
    })),
    totalQuantity,
    totalAmount,
  };
};
module.exports.mergeCartService = async (userId, sessionItems) => {
  console.log("Đã chạy vào đây");
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    return await Cart.create({ userId, items: sessionItems });
  }

  sessionItems.forEach((sItem) => {
    const itemIndex = cart.items.findIndex(
      (p) => p.productId.toString() === sItem.productId.toString()
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += sItem.quantity;
      cart.items[itemIndex].price = sItem.price;
    } else {
      cart.items.push({
        productId: sItem.productId,
        quantity: sItem.quantity,
        price: sItem.price,
      });
    }
  });

  cart.markModified("items");

  return await cart.save();
};
