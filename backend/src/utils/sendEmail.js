const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER is not configured");
  }

  if (!process.env.EMAIL_PASS) {
    throw new Error("EMAIL_PASS is not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"jerSEys Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

module.exports = sendEmail;
