const {
  addToCartService,
  removeItemService,
  updateQuantityService,
  getFullCartService,
  mergeCartService,
} = require("./cart.service");
module.exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const cart = await getFullCartService(userId);

    if (!cart) {
      return res.status(200).json({
        message: "Giỏ hàng trống",
        data: { items: [], totalAmount: 0 },
      });
    }

    res.status(200).json({ message: "Lấy giỏ hàng thành công", data: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?.sub;
    await addToCartService(userId, req.body);

    const updatedCart = await getFullCartService(userId);
    res.status(200).json({ message: "Đã thêm vào giỏ", data: updatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user?.sub;
    await updateQuantityService(userId, req.body);

    const updatedCart = await getFullCartService(userId);
    res
      .status(200)
      .json({ message: "Đã cập nhật số lượng", data: updatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.deleteItem = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { productId } = req.params;
    await removeItemService(userId, productId);

    const updatedCart = await getFullCartService(userId);
    res.status(200).json({ message: "Đã xóa sản phẩm", data: updatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.mergeCart = async (req, res) => {
  try {
 
    const userId = req.user?.sub;
    const { items } = req.body;

    if (items && items.length > 0) {
      await mergeCartService(userId, items);
    }

    const updatedCart = await getFullCartService(userId);

    res.status(200).json({
      message: "Đồng bộ giỏ hàng thành công ✨",
      data: updatedCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
