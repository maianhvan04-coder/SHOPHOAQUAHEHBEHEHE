const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: { type: String, required: true },

    // fixed 7 ngày tính từ lúc login/register
    expiresAt: { type: Date, required: true, index: true },

    revokedAt: { type: Date, default: null },

    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },

    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// TTL: Mongo tự xóa khi expiresAt tới
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);
