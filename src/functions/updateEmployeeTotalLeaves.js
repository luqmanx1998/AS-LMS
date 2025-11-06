import supabase from "./supabase";

/**
 * Updates the total_leaves JSON for an employee manually (from Edit Balance modal).
 * Accepts the new total_leaves object and overwrites the existing one.
 */
export async function updateEmployeeTotalLeaves(employeeId, newTotalLeaves) {
  try {
    const { error } = await supabase
      .from("employees")
      .update({ total_leaves: newTotalLeaves })
      .eq("id", employeeId);

    if (error) throw error;
    console.log(`✅ Updated total_leaves for employee ${employeeId}`);
  } catch (err) {
    console.error("❌ Error updating total_leaves:", err.message);
    throw err;
  }
}
