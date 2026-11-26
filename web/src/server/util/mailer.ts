import nodemailer from "nodemailer";

const RECEIVER: string = process.env.STAFF_ALERT_EMAIL || "";

export async function sendEmail(
  subject: string,
  htmlBody: string,
): Promise<void> {
  const gmailUser = "noreply@vxreal.com";
  const gmailPassword = process.env.GMAIL_PWD || "";

  if (!RECEIVER) {
    console.warn(
      "No recipient email provided and STAFF_ALERT_EMAIL is not set.",
    );
    return;
  }

  if (!gmailPassword) {
    console.warn("GMAIL_PWD is not set in environment variables.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  const mailOptions = {
    from: {
      name: "AnswerTrace",
      address: gmailUser,
    },
    to: RECEIVER,
    subject,
    text: "Please use an HTML-compatible email client.",
    html: htmlBody,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send email: ${error}`);
  }
}
