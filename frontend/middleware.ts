export { auth as middleware } from "@/lib/auth";

export const config = {
  // Protect tất cả route trừ login, api, static files
  matcher: [
    "/((?!login|register|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
