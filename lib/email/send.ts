import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return;
  }

  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (err) {
    // Never let email failures break the main action
    console.error("[email] Failed to send:", err);
  }
}
