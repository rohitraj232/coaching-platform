
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import LogoutButton from "@/components/auth/LogoutButton";
import { FiBell, FiShield } from "react-icons/fi";

export default async function AdminHeader() {
  const user = await getCurrentUser();

  if (!user) return null;

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const adminName =
    profile?.full_name ||
    user.email?.split("@")[0] ||
    "Admin";

  const initials = adminName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part:string) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 pl-16 shadow-sm sm:px-6 sm:pl-20 lg:px-8">
      {/* Left section */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
          Admin Panel
        </h1>
        <p className="hidden text-xs text-slate-500 sm:block">
          Manage your coaching platform
        </p>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <FiBell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
        </button> */}

        <div className="hidden h-9 w-px bg-slate-200 sm:block" />

        {/* Admin profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#0B5A93]">
            {initials || "AD"}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[160px] truncate text-sm font-semibold text-slate-800">
              {adminName}
            </p>

            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <FiShield size={12} />
              Administrator
            </div>
          </div>
        </div>

        <div className="hidden h-9 w-px bg-slate-200 sm:block" />

        <LogoutButton />
      </div>
    </header>
  );
}
