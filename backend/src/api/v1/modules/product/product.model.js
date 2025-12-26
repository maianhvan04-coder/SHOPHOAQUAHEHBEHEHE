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
        name: { type: String, required: true, unique: true, trim: true },

        // vẫn dùng slug-updater như bạn đang làm
        slug: { type: String, slug: "name", unique: true, index: true, trim: true },

        // ✅ GIỮ FIELD CŨ để không vỡ data (1 ảnh)
        image: {
            type: {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
            },
            required: true,
        },

        // ✅ THÊM FIELD MỚI: nhiều ảnh
        images: { type: [imageSchema], default: [] },

        // ✅ đồng bộ schema mới: categoryId (nhưng vẫn giữ category để khỏi vỡ)
        // Nếu code backend/frontend đang dùng "category" thì giữ nguyên.
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },
        // Nếu bạn muốn đổi sang categoryId theo schema mới thì dùng field này
        // categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },

        price: { type: Number, required: true, min: 0 },

        // ✅ THÊM stock
        stock: { type: Number, default: 0, min: 0 },

        // giữ lại field cũ
        sold: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },

        description: { type: String, default: "", trim: true },

        // ✅ THÊM featured
        isFeatured: { type: Boolean, default: false, index: true },
        featuredRank: { type: Number, default: 0, index: true }, // 0 = không ưu tiên

        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// ✅ index như schema mới
productSchema.index({ isFeatured: -1, featuredRank: 1, createdAt: -1 });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
