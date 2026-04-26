const { Resend } = require("resend");

const sendEmail = async (to, subject, text) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const response = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text
  });

  if (response?.error) {
    throw new Error(response.error.message || "Failed to send email with Resend");
  }

  return response;
};

module.exports = {
  sendEmail
};
