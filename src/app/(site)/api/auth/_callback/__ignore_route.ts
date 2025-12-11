import userService from "@/services/api/userService";
import { type NextRequest, NextResponse } from "next/server";
import { createOrUpdateUser, updateUserWallet } from "@/services/userService";
import createClient from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  try {
    const next = origin + (req.nextUrl.searchParams.get("next") || "/");
    const error = req.nextUrl.searchParams.get("error");
    console.log("Next", next);

    if (error) {
      return NextResponse.redirect(
        `${origin}/${next}?error=${encodeURIComponent(error)}`
      );
    }

    const code = req.nextUrl.searchParams.get("code") as string;

    if (!code) {
      return NextResponse.redirect(
        `${origin}/?error=No authorization code provided`
      );
    }

    const supabase = await createClient();
    const { data, error: supabaseError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (supabaseError) {
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent(supabaseError.message)}`
      );
    }

    if (data && data.user) {
      try {
        const dbUser = await createOrUpdateUser(data.user);
        const response = await userService.getAddress(dbUser.id);
        await updateUserWallet(dbUser.id, {
          walletAddress: response.address,
          walletType: response?.walletType || "",
        });
      } catch (dbError) {
        console.error("Error saving user data to database:", dbError);
      }
    }

    console.log("Redirecting to:", next);
    return NextResponse.redirect(next);
  } catch (error) {
    console.error("Unexpected error in callback:", error);
    return NextResponse.redirect(
      `${origin}/profile?error=Unexpected error during authentication`
    );
  }
}
