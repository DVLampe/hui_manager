import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Yêu cầu đặt lại mật khẩu cho tài khoản của bạn',
    html: `
      <h1>Yêu cầu đặt lại mật khẩu</h1>
      <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
      <a href="${resetLink}" target="_blank" style="background-color: #4f46e5; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px;">Đặt lại mật khẩu</a>
      <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
      <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
