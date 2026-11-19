
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, class_level")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your student account.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <p className="text-sm text-slate-500">Full Name</p>
            <p className="mt-1 font-semibold text-slate-900">
              {profile?.full_name || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-1 font-semibold text-slate-900">
              {user.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Phone</p>
            <p className="mt-1 font-semibold text-slate-900">
              {profile?.phone || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Class</p>
            <p className="mt-1 font-semibold text-slate-900">
              {profile?.class_level
                ? `Class ${profile.class_level}`
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to Home
          </Link>

          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
