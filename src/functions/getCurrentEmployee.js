import supabase from "./supabase";

export async function getCurrentEmployee() {
  try {
    // ✅ Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    // ✅ Fetch employee data by the auth user's ID
    const { data: employee, error } = await supabase
      .from("employees")
      .select("id, full_name, role, department, email")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching employee:", error.message);
      return null;
    }

    return employee;
  } catch (err) {
    console.error("Unexpected error in getCurrentEmployee:", err.message);
    return null;
  }
}
