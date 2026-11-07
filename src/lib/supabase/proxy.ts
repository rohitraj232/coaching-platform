import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet, headers) {
          // Update request cookies so the current request sees fresh tokens.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Rebuild the response with the updated request.
          supabaseResponse = NextResponse.next({
            request,
          });

          // Send refreshed cookies to the browser.
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          // Preserve headers supplied by Supabase.
          if (headers) {
            Object.entries(headers).forEach(([name, value]) => {
              supabaseResponse.headers.set(name, value);
            });
          }
        },
      },
    }
  );

  // Verifies the token and refreshes it when needed.
  await supabase.auth.getClaims();

  return supabaseResponse;
}