import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import supabase from "../functions/supabase";

export default function ProtectedRoute({ allowedRole }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      // ✅ Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      // ✅ Fetch employee data by user id
      const { data: employee, error } = await supabase
        .from("employees")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) console.error("Role fetch error:", error.message);
      setUserRole(employee?.role || null);
      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) return null; // You can add a spinner later

  // ✅ Redirect if not logged in
  if (!userRole) return <Navigate to="/" replace />;

  // ✅ Redirect if wrong role
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // ✅ Allow access
  return <Outlet />;
}
