
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { FaSignOutAlt } from "react-icons/fa";
// import { createClient } from "@/lib/supabase/client";

// export default function LogoutButton() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleLogout = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const supabase = createClient();

//       const { error: logoutError } = await supabase.auth.signOut();

//       if (logoutError) {
//         setError(logoutError.message);
//         return;
//       }

//       router.replace("/");
//       router.refresh();
//     } catch (error) {
//       console.error("Logout error:", error);
//       setError("Unable to logout. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <button
//         type="button"
//         onClick={handleLogout}
//         disabled={loading}
//         className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
//       >
//         <FaSignOutAlt />
//         {loading ? "Logging out..." : "Logout"}
//       </button>

//       {error && (
//         <p className="mt-2 text-sm text-red-600">{error}</p>
//       )}
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  variant?: "default" | "dropdown";
  onLogout?: () => void;
}

export default function LogoutButton({
  variant = "default",
  onLogout,
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        setError(logoutError.message);
        return;
      }

      onLogout?.();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setError("Unable to logout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={
          variant === "dropdown"
            ? "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            : "inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        }
      >
        <FaSignOutAlt />
        {loading ? "Logging out..." : "Logout"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
