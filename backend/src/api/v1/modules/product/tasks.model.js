const mongoose = require("mongoose");
const removeAccent = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const taskSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    keywordNoAccent: {
  type: String,
  required: true,
  index: true,
},
    type: {
      type: String,
      default: "alias",
    },
    note: { type: String },
  },
  { timestamps: true }
);
taskSchema.pre("save", function (next) {
  if (this.isModified("keyword")) {
    this.keywordNoAccent = removeAccent(this.keyword);
  }
  next();
});
const Tasks = mongoose.model("Tasks", taskSchema);
module.exports = Tasks;
