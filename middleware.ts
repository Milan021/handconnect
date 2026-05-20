import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = "https://rzpryrssvdphekjykfqu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cHJ5cnNzdmRwaGVranlrZnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMyODIsImV4cCI6MjA5NDA1OTI4Mn0.l6R93pBz5bwxMuTkV8DSP5BI-6Dv1V-Q3FH1jVaXzzM";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/cgu",
  "/mentions-legales",
  "/politique-confidentialite",
]);

const AUTH_REDIRECT_PATHS = new Set(["/", "/login", "/register"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const res = NextResponse.next();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => req.cookies.getAll().map(({ name, value }) => ({ name, value })),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Public path : si déjà connecté sur /login ou /register, push vers /annonces ou /dashboard
  if (PUBLIC_PATHS.has(pathname)) {
    if (user && AUTH_REDIRECT_PATHS.has(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return res;
  }

  // Routes protégées : bloque si pas de session
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (assets)
     * - _next/image (optimisation images)
     * - favicon.ico, fichiers statiques
     * - api/* (API routes gérées séparément)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf)$).*)",
  ],
};
