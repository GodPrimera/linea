"use server";

import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";

export type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactMessageAction(data: ContactFormData) {
  if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
    throw new Error("Name, email and message are required");
  }

  await db.insert(contactMessages).values({
    name: data.name.trim(),
    email: data.email.trim(),
    subject: data.subject.trim() || "No subject",
    message: data.message.trim(),
  });
}
