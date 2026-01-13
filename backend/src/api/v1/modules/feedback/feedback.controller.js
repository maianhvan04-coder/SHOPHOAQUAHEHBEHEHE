const feedbackService = require("./feedback.service");

/**
 * POST /feedback
 * Tạo feedback mới
 */
module.exports.createFeedback = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { productId, orderId, rating, comment, images } = req.body;

    const feedback = await feedbackService.createFeedback({
      userId,
      productId,
      orderId,
      rating,
      comment,
      images,
    });

    return res.status(201).json({
      EC: 0,
      EM: "Đánh giá sản phẩm thành công",
      DT: feedback,
    });
  } catch (error) {
    return res.status(400).json({
      EC: 1,
      EM: error.message || "Không thể tạo đánh giá",
      DT: null,
    });
  }
};

/**
 * PUT /feedback/:id
 * Cập nhật feedback
 */
module.exports.updateFeedback = async (req, res) => {
  try {
    const userId = req.user.sub;
    const feedbackId = req.params.id;
    const { rating, comment, images } = req.body;

    const feedback = await feedbackService.updateFeedback({
      feedbackId,
      userId,
      rating,
      comment,
      images,
    });

    return res.json({
      EC: 0,
      EM: "Cập nhật đánh giá thành công",
      DT: feedback,
    });
  } catch (error) {
    return res.status(400).json({
      EC: 1,
      EM: error.message || "Không thể cập nhật đánh giá",
      DT: null,
    });
  }
};

/**
 * GET /feedback/product/:productId
 * Lấy feedback theo product (public)
 */
module.exports.getFeedbacksByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page, limit } = req.query;

    const data = await feedbackService.getFeedbacksByProduct({
      productId,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    return res.json({
      EC: 0,
      EM: "Lấy danh sách đánh giá thành công",
      DT: data,
    });
  } catch (error) {
    return res.status(500).json({
      EC: 1,
      EM: "Lỗi server",
      DT: null,
    });
  }
};

/**
 * GET /feedback/product/:productId/summary
 * Lấy rating trung bình của product
 */
module.exports.getProductRatingSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    const summary = await feedbackService.getProductRatingSummary(productId);

    return res.json({
      EC: 0,
      EM: "Lấy thông tin đánh giá thành công",
      DT: summary,
    });
  } catch (error) {
    return res.status(500).json({
      EC: 1,
      EM: "Lỗi server",
      DT: null,
    });
  }
};

/**
 * GET /feedback/check?orderId=&productId=
 * Kiểm tra user đã đánh giá sản phẩm trong đơn chưa
 */
module.exports.getFeedbackByOrderAndProduct = async (req, res) => {
  try {
    const userId = req.user.sub;
    console.log("UserId bên controller", userId);
    const { orderId, productId } = req.query;

    const feedback = await feedbackService.getFeedbackByOrderAndProduct({
      orderId,
      productId,
      userId,
    });

    return res.json({
      EC: 0,
      EM: "Kiểm tra đánh giá thành công",
      DT: feedback,
    });
  } catch (error) {
    return res.status(500).json({
      EC: 1,
      EM: `Lỗi server ${error.message}`,
      DT: null,
    });
  }
};
