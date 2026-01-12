const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // ✅ staff phụ trách / tạo đơn
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      // required: true, // bật sau khi migrate
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    customerNote: { type: String, trim: true, default: "" },
    shopNote: { type: String, trim: true, default: "" },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      province: { type: String, required: true }, 
     
      ward: { type: String, required: true },
      addressDetails: { type: String, required: true },
    },
    paymentMethod: { type: String, default: "COD" },

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },

    status: {
      isPaid: { type: Boolean, default: false },
      paidAt: { type: Date },
      isDelivered: { type: Boolean, default: false },
      deliveredAt: { type: Date },
      orderStatus: {
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Pending",
      },
    },
  },
  { timestamps: true }
);

orderSchema.index({ staff: 1, createdAt: 1 });                         // staff xem theo tháng
orderSchema.index({ "status.orderStatus": 1, createdAt: 1 });          // lọc status theo tháng (admin)
orderSchema.index({ staff: 1, "status.orderStatus": 1, createdAt: 1 }); // staff + status + tháng (query KPI)

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
