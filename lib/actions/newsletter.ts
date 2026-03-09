"use server";

export async function subscribeToNewsletter(email: string): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/newsletter/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error ?? "Something went wrong." };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("[subscribeToNewsletter]", error);
    return { error: "Something went wrong. Please try again." };
  }
}
