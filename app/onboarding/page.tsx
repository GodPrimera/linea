import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingForm from "./_components/OnboardingForm";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome to Linea</h1>
          <p className="text-muted-foreground mt-1">
            Choose a username to get started.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}