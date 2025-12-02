import supabase from "./supabase";

export async function createEmployee({ email, password, full_name, department, role }) {
  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw authError;

  // Get the user ID from Auth
  const userId = authData.user?.id;
  if (!userId) {
    throw new Error("Failed to get user ID from authentication");
  }

  // 2. Default leave values
  let defaultLeaves = {
    annualLeave: { used: 0, remaining: 14 },
    medicalLeave: { used: 0, remaining: 14 },
    compassionateLeave: { used: 0, remaining: 5 },
    hospitalisationLeave: { used: 0, remaining: 46 }
  };

  // Special case for admins → 21 annual leave
  if (role === "admin") {
    defaultLeaves.annualLeave.remaining = 21;
  }

  // 3. Insert employee profile using the SAME ID from Auth
  const { data: insertData, error: insertError } = await supabase
    .from("employees")
    .insert([
      {
        id: userId, // THIS IS THE KEY FIX - use the auth user ID
        email,
        full_name,
        department,
        role,
        total_leaves: defaultLeaves
      }
    ])
    .select();

  if (insertError) throw new Error(insertError.message);

  return insertData;
}