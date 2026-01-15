const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: "" },
    publicId: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: true,
      index: true,
    },
    updateBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",

      index: true,
    },
    deletedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      index: true,
    },
    // vẫn dùng slug-updater như bạn đang làm
    slug: { type: String, slug: "name", index: true, trim: true },

    image: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
      required: false,
    },

    images: { type: [imageSchema], default: [] },

    // Nếu code backend/frontend đang dùng "category" thì giữ nguyên.
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },

    // THÊM stock
    stock: { type: Number, default: 0, min: 0 },

    // giữ lại field cũ
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    description: { type: String, default: "", trim: true },

    //THÊM featured
    isFeatured: { type: Boolean, default: false, index: true },
    featuredRank: { type: Number, default: 0, index: true }, // 0 = không ưu tiên

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: "vi", strength: 2 },
  }
);

// index như schema mới
productSchema.index({ isFeatured: -1, featuredRank: 1, createdAt: -1 });
productSchema.index({ category: 1, isDeleted: 1 });
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
