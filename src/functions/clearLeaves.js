import supabase from "./supabase";

export async function clearAllLeaves() {
  // Add a WHERE clause that matches all rows to bypass RLS
  const { error } = await supabase
    .from("leaves")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // This will match all rows since no ID equals this

  if (error) throw new Error("Failed to clear all leaves: " + error.message);
  return true;
}

export async function clearLeavesOlderThan(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const { error } = await supabase
    .from("leaves")
    .delete()
    .lt("created_at", cutoffDate.toISOString());

  if (error) throw new Error("Failed to clear old leaves: " + error.message);
  return true;
}