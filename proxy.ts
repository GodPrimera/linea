import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
  "/bookmarks(.*)",
  "/notifications(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId: clerkId, sessionClaims } = await auth();

  if (!clerkId) {
    if (isProtectedRoute(req)) await auth.protect();
    return NextResponse.next();
  }

  const isOnboarding = req.nextUrl.pathname.startsWith("/onboarding");
  const onboardingComplete =
    (sessionClaims?.metadata as any)?.onboardingComplete === true;

  if (!onboardingComplete && !isOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (onboardingComplete && isOnboarding) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute(req)) await auth.protect();

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};