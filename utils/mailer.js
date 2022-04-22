import nodemailer from "nodemailer";

const adminEmail = "luffy3042001@gmail.com";
const adminPassword = "xisxmipeknfoqgzn";

const mailHost = "smtp.gmail.com";
const mailPort = 587;

export const sendMail = (to, subject, htmlContent) => {
  /**
   *Khởi tạo một thằng transporter object sử dụng chuẩn giao thức 
   truyền tải SMTP với các thông tin cấu hình ở trên.
   */
  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: false,
    // Neu dung port 465 thi de la true
    auth: {
      user: adminEmail,
      pass: adminPassword,
    },
  });

  const option = {
    from: adminEmail,
    to: to,
    subject: subject,
    html: htmlContent, //Noi dung chua html thay vi noi dung don thuan
  };

  return transporter.sendMail(option);
};