import supabase from "./supabase";

export async function createEmployee({ email, password, full_name, department, role }) {
  // Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;

  // Insert employee record
  const { error: insertError } = await supabase.from("employees").insert([
    {
      id: data.user.id,
      email,
      full_name,
      department,
      role,
      created_at: new Date().toISOString(),
    },
  ]);

  if (insertError) throw insertError;

  return data.user; // Return the new user (optional)
}
