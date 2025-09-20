import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkSession } from "./lib/api/serverApi";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];
const PRIVATE_ROUTES = ["/profile", "/notes"];

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));

  const sessionValid = !!accessToken;

  if (!accessToken && refreshToken) {
    try {
      const { data: newTokens } = await checkSession();

      const res = NextResponse.next();

      if (newTokens.accessToken) {
        res.cookies.set("accessToken", newTokens.accessToken, {
          httpOnly: true,
          secure: true,
          path: "/",
        });
      }
      if (newTokens.refreshToken) {
        res.cookies.set("refreshToken", newTokens.refreshToken, {
          httpOnly: true,
          secure: true,
          path: "/",
        });
      }

      return res;
    } catch {
      const res = NextResponse.redirect(new URL("/sign-in", req.url));
      res.cookies.delete({ name: "accessToken", path: "/" });
      res.cookies.delete({ name: "refreshToken", path: "/" });
      return res;
    }
  }

  if (!sessionValid && isPrivate) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

 
  if (sessionValid && isPublic) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/profile/:path*", "/notes/:path*"],
};