const cartService = require("./cart.service");

exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { productId, quantity } = req.body;
    const result = await cartService.addProductToCart(
      userId,
      productId,
      quantity
    );
    return res.status(200).json({
      success: true,
      message: "Thêm vào giỏ hàng thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
   
    const userId = req.user.sub;
    const cartData = await cartService.getCartDetails(userId);

    return res.status(200).json({
      success: true,
      data: cartData,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateQuantityCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.sub;
    
    await cartService.updateQuantityCart(userId, productId, quantity);
    const cart = await cartService.getCartDetails(userId);
    
    return res.status(200).json({
      success: true,
      message: "Cập nhật số lượng thành công",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};


exports.deleteFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const userId = req.user.sub;

    await cartService.deleteFromCart(userId, productId);
    const cart = await cartService.getCartDetails(userId);

    return res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};