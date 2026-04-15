import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const authObj = await auth();
  const path = req.nextUrl.pathname;

  // Jika sudah login, root dan auth pages langsung ke dashboard
  if (authObj.userId && (path === '/' || path.startsWith('/login') || path.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Jika belum login, protect dashboard
  if (!authObj.userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
