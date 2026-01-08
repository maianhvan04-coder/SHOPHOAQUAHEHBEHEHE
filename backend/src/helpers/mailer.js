const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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
