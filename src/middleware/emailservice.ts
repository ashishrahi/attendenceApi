import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";

dotenv.config();

type MailOptions = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string; // optional override
  attachments?: Array<{ filename: string; path?: string; content?: Buffer | string }>;
};

let transporter: Transporter<SMTPTransport.SentMessageInfo>;

function createSmtpTransport(): Transporter<SMTPTransport.SentMessageInfo> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration (SMTP_HOST/SMTP_USER/SMTP_PASS) missing in env");
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports (STARTTLS)
    auth: {
      user,
      pass,
    },
    // optional pool, rateLimit etc can be configured here for production
  } as SMTPTransport.Options);

  return transport;
}

export async function initMailer(): Promise<void> {
  if (transporter) return;
  transporter = createSmtpTransport();
  // verify connection configuration (helpful at startup)
  try {
    await transporter.verify();
    // console.log("Mailer ready");
  } catch (err) {
    // If verification fails, rethrow or handle gracefully.
    throw new Error(`Mailer verification failed: ${(err as Error).message}`);
  }
}

export async function sendMail(options: MailOptions): Promise<nodemailer.SentMessageInfo> {
  if (!transporter) {
    await initMailer();
  }

  const fromEnv = `${process.env.MAIL_FROM_NAME ?? ""} <${process.env.MAIL_FROM_EMAIL ?? ""}>`;
  const mail = {
    from: options.from ?? fromEnv,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  };

  try {
    const info = await transporter.sendMail(mail);
    return info;
  } catch (err) {
    // Attach more context if you want, and rethrow so caller can log/handle
    const e = err as Error;
    throw new Error(`Failed to send email: ${e.message}`);
  }
}
