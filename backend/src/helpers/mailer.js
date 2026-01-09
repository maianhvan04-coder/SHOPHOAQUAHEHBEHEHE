const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
require("dotenv").config();
exports.sendResetPasswordEmail = async ({ to, resetUrl }) => {
  const from = process.env.MAIL_FROM || "no-reply@send.maianhvan04.id.vn";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Đặt lại mật khẩu",
    html: `
      <div style="font-family:Arial;line-height:1.6">
        <h2>Đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Bấm vào nút bên dưới:</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none">
            Đặt lại mật khẩu
          </a>
        </p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        <p><small>Link hết hạn sau 15 phút.</small></p>
      </div>
    `,
  });

  if (error) {
    console.error("RESEND_ERROR:", error);
    throw new Error(error.message || "Send email failed");
  }

  return data; // { id: ... }
};
exports.sendOrderConfirmationEmail = async ({ to, order }) => {
  const from = process.env.MAIL_FROM || "no-reply@send.maianhvan04.id.vn";
  // Sử dụng URL thực tế của bạn
  const orderUrl = `${process.env.APP_URL}/order-detail/${order._id}`;
  console.log("Vào đến đây, gửi mail đến", to);
  const orderItemsHtml = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 14px;">
          x${item.quantity}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; font-weight: bold; color: #49a760;">
          ${item.price.toLocaleString()}đ
        </td>
      </tr>
    `
    )
    .join("");

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: `Joygreen - Xác nhận đơn hàng #${order._id
      .toString()
      .slice(-6)
      .toUpperCase()}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
        <div style="background: #153a2e; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">JOYGREEN</h1>
          <p style="margin: 10px 0 0 0; color: #c4cd38; font-weight: bold;">Cảm ơn bạn đã tin chọn hoa quả sạch!</p>
        </div>

        <div style="padding: 30px 25px; color: #334155;">
          <p style="font-size: 16px;">Chào <strong>${
            order.shippingAddress.fullName
          }</strong>,</p>
          <p style="line-height: 1.6;">Đơn hàng của bạn đã được hệ thống ghi nhận thành công. Chúng tôi sẽ sớm giao những sản phẩm tươi ngon nhất đến <strong>${
            order.shippingAddress.ward
          } - ${order.shippingAddress.province}</strong> cho bạn.</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${orderUrl}" style="background-color: #153a2e; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: 800; border-radius: 10px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-transform: uppercase; font-size: 14px;">
              Xem Chi Tiết Đơn Hàng Tại Đây
            </a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px dashed #cbd5e1;">
            <p style="margin: 0; font-size: 14px;"><strong>Mã đơn hàng:</strong> <span style="color: #49a760;">#${
              order._id
            }</span></p>
            <p style="margin: 8px 0 0 0; font-size: 14px;"><strong>Thanh toán:</strong> ${
              order.paymentMethod
            }</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px 10px; text-align: left; font-size: 13px; color: #64748b; text-transform: uppercase;">Sản phẩm</th>
                <th style="padding: 12px 10px; font-size: 13px; color: #64748b; text-transform: uppercase;">SL</th>
                <th style="padding: 12px 10px; text-align: right; font-size: 13px; color: #64748b; text-transform: uppercase;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 25px; border-top: 2px solid #f1f5f9; padding-top: 15px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0; color: #64748b;">Tạm tính:</td>
                <td style="padding: 5px 0; text-align: right;">${order.itemsPrice.toLocaleString()}đ</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;">Phí vận chuyển:</td>
                <td style="padding: 5px 0; text-align: right;">${order.shippingPrice.toLocaleString()}đ</td>
              </tr>
              <tr>
                <td style="padding: 15px 0; font-size: 18px; font-weight: bold; color: #153a2e;">TỔNG CỘNG:</td>
                <td style="padding: 15px 0; text-align: right; font-size: 20px; font-weight: 900; color: #ef4444;">${order.totalPrice.toLocaleString()}đ</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 15px; border-left: 4px solid #c4cd38; background: #fefce8; font-size: 13px; color: #713f12;">
            <strong>Ghi chú đơn hàng:</strong><br/>
            ${order.customerNote || "Không có ghi chú"}
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 25px; text-align: center; font-size: 12px; color: #64748b;">
          <p style="margin: 0;"><strong>JOYGREEN FRUIT STORE</strong></p>
          <p style="margin: 5px 0;">Địa chỉ: 226 Lê Trọng Tấn, P.Định Công, Hà Nội <br/> 131 Chu Huy Mân, P.Phúc Đổng, Hà Nội</p>
          <p style="margin: 5px 0;">Hotline: 09xx xxx xxx</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Gửi email lỗi:", error);
  }
  return data;
};
