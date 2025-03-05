import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT ?? "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASS,
  },
});

export class mailer {
  static async send(options: { to: string; subject: string; html: string }) {
    await transporter.sendMail({
      from: process.env.EMAIL_SERVER_USER!,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
