const mongoose = require("mongoose");
const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    rating: { type: Number, required: true, min: 1, max: 5 },

    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      validate: {
        validator: function (v) {
          if (this.rating <= 2) return v && v.length > 0;
          return true;
        },
        message: "Vui lòng cho biết lý do nếu đánh giá từ 2 sao trở xuống",
      },
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 6,
        message: "Bạn chỉ được tải lên tối đa 6 hình ảnh.",
      },
    },

    isUpdated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

feedbackSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });
feedbackSchema.index({ productId: 1, createdAt: -1 });

feedbackSchema.pre("save", function (next) {
  if (!this.isNew) this.isUpdated = true;
  next();
});
const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
