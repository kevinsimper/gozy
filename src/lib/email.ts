import {
  Resend,
  ResendResponse,
  ResendEmailResponse,
} from "../services/resend";
import { createNotification } from "../models/notification";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  resendApiKey: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  resendApiKey,
}: SendEmailParams) {
  const resend = new Resend(resendApiKey);

  return resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    html,
  });
}

type SendAndLogEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  userId?: number;
};

export async function sendAndLogEmail(
  c: { env: { DB: D1Database; RESEND_API_KEY: string } },
  { to, subject, html, userId }: SendAndLogEmailParams,
): Promise<ResendResponse<ResendEmailResponse>> {
  const resend = new Resend(c.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    html,
  });

  const recipients = Array.isArray(to) ? to : [to];
  for (const recipient of recipients) {
    await createNotification(c, {
      channel: "email",
      recipient,
      subject,
      content: html,
      userId,
    });
  }

  return result;
}
