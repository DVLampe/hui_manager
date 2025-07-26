// src/middleware.js
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If the user is trying to access an admin route and is not an admin, redirect them.
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      // You can redirect them to a generic "unauthorized" page or the home page.
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // If the checks pass, continue to the requested page.
    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback is used to decide if the middleware should be applied.
      // If `authorized` returns `true`, the `middleware` function above will be executed.
      // If it returns `false`, the user will be redirected to the sign-in page.
      authorized: ({ token }) => {
        // !!token converts the token object (or null) to a boolean.
        // This ensures that the user is at least logged in to access any page
        // covered by the matcher (except for the pages defined in next-auth.js `pages`).
        return !!token;
      },
    },
  }
)

// The matcher configures which paths the middleware will run on.
export const config = { 
    matcher: [
        "/admin/:path*",
        "/dashboard",
        "/profile",
        "/settings",
        "/hui/:path*",
        "/members/:path*",
        "/payments/:path*",
        "/future-schedule/:path*",
    ] 
};
