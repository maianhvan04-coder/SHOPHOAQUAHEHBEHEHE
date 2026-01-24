const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const productSchema = new mongoose.Schema(
  {
    // ===== CORE =====
    name: { type: String, required: true, trim: true },

    slug: { type: String, slug: "name", index: true, trim: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    unit: {
      type: String,
      enum: ["kg", "gram", "box", "piece"],
      default: "box",
    },
    price: { type: Number, required: true, min: 0 },

    // ===== FEATURED =====
    isFeatured: { type: Boolean, default: false, index: true },
    featuredRank: { type: Number, default: 0, index: true },

    // ===== STATUS =====
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    // ===== AUDIT =====
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      index: true,
    },
    deletedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

productSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "vi", strength: 2 } }
);

productSchema.index({ isFeatured: -1, featuredRank: 1, createdAt: -1 });
productSchema.index({ category: 1, isDeleted: 1 });

module.exports = mongoose.model("Product", productSchema);

