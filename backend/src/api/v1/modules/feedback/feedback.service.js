const Feedback = require("./feedback.model");
const mongoose = require("mongoose");

/**
 * Tạo feedback mới
 */
const updateProductRatingOnCreate = async (productId, newRating) => {
  const product = await Product.findById(productId);

  const total = product.rating * product.ratingCount + newRating;
  const count = product.ratingCount + 1;

  product.ratingCount = count;
  product.rating = Number((total / count).toFixed(1));

  await product.save();
};
const updateProductRatingOnUpdate = async (productId, oldRating, newRating) => {
  const product = await Product.findById(productId);

  const total = product.rating * product.ratingCount - oldRating + newRating;

  product.rating = Number((total / product.ratingCount).toFixed(1));

  await product.save();
};
module.exports.createFeedback = async ({
  userId,
  productId,
  orderId,
  rating,
  comment,
  images,
}) => {
  // check ObjectId
  if (
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new Error("ID không hợp lệ");
  }
  const existed = await Feedback.exists({
    userId,
    productId,
    orderId,
  });

  if (existed) {
    throw new Error("Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi");
  }
  // tạo feedback
  const feedback = await Feedback.create({
    userId,
    productId,
    orderId,
    rating,
    comment,
    images,
  });
  await updateProductRatingOnCreate(productId, rating);
  return feedback;
};

/**
 * Cập nhật feedback (chỉ chủ feedback mới sửa được)
 */
module.exports.updateFeedback = async ({
  feedbackId,
  userId,
  rating,
  comment,
  images,
}) => {
  const feedback = await Feedback.findOne({
    _id: feedbackId,
    userId,
  });

  if (!feedback) {
    throw new Error("Không tìm thấy feedback hoặc bạn không có quyền sửa");
  }

  if (rating !== undefined) feedback.rating = rating;
  if (comment !== undefined) feedback.comment = comment;
  if (images !== undefined) feedback.images = images;

  const oldRating = feedback.rating;
  // update feedback.rating
  await feedback.save();

  if (rating !== undefined && rating !== oldRating) {
    await updateProductRatingOnUpdate(feedback.productId, oldRating, rating);
  }
  return feedback;
};

/**
 * Lấy feedback theo product (có phân trang)
 */
module.exports.getFeedbacksByProduct = async ({
  productId,
  page = 1,
  limit = 10,
}) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return {
      feedbacks: [],
      total: 0,
      page,
      totalPages: 0,
    };
  }
  const skip = (page - 1) * limit;

  const [feedbacks, total] = await Promise.all([
    Feedback.find({ productId })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Feedback.countDocuments({ productId }),
  ]);

  return {
    feedbacks,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Tính rating trung bình của product
 */
module.exports.getProductRatingSummary = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return { averageRating: 0, totalReviews: 0 };
  }
  const result = await Feedback.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!result.length) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  return {
    averageRating: Number(result[0].averageRating.toFixed(1)),
    totalReviews: result[0].totalReviews,
  };
};

module.exports.getFeedbackByOrderAndProduct = async ({
  orderId,
  productId,
  userId,
}) => {
  console.log("userId bên service: ", userId);
  if (
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return null;
  }

  return Feedback.findOne({
    orderId,
    productId,
    userId,
  });
};
