const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },

    // ✅ slug tự động tạo từ name
    slug: { type: String, slug: "name", unique: true, index: true },

    description: { type: String, trim: true, default: "" },

    type: { type: String, trim: true, default: "single" },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
