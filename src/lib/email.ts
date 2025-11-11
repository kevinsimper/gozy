import { Resend } from "../services/resend";

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
