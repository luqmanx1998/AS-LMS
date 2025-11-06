import supabase from "./supabase";

/**
 * Updates an employee's total_leaves JSON when a leave is approved.
 * Automatically deducts the number of days approved.
 */
export async function updateEmployeeLeaveBalance(employeeId, leaveType, startDate, endDate) {
  try {
    // 1️⃣ Fetch the employee’s current total_leaves
    const { data: employee, error: fetchError } = await supabase
      .from("employees")
      .select("total_leaves")
      .eq("id", employeeId)
      .single();

    if (fetchError) throw fetchError;
    if (!employee?.total_leaves) throw new Error("Employee leave data not found");

    // 2️⃣ Clone the JSON
    const totalLeaves = { ...employee.total_leaves };

    // 3️⃣ Calculate the number of days between start and end
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysTaken = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // 4️⃣ Normalize the key based on leaveType
    const leaveKey =
      leaveType === "Annual"
        ? "annualLeave"
        : leaveType === "Medical"
        ? "medicalLeave"
        : null;

    if (!leaveKey || !totalLeaves[leaveKey]) {
      console.warn("No matching leave type in total_leaves:", leaveType);
      return;
    }

    // 5️⃣ Update remaining and used counts safely
    totalLeaves[leaveKey].remaining = Math.max(
      0,
      (totalLeaves[leaveKey].remaining || 0) - daysTaken
    );
    totalLeaves[leaveKey].used =
      (totalLeaves[leaveKey].used || 0) + daysTaken;

    // 6️⃣ Update Supabase
    const { error: updateError } = await supabase
      .from("employees")
      .update({ total_leaves: totalLeaves })
      .eq("id", employeeId);

    if (updateError) throw updateError;

    console.log(`✅ Updated leave balance for ${employeeId}: -${daysTaken} ${leaveType}`);
  } catch (err) {
    console.error("❌ Error updating leave balance:", err.message);
  }
}
