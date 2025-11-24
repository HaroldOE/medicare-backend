import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"MediChain" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent to", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
