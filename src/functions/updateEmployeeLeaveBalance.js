import supabase from "./supabase";

export async function updateEmployeeLeaveBalance(
  employeeId,
  leaveType,
  startDate,
  endDate,
  dayFraction = 1,
  mode = "deduct"
) {
  try {
    const { data: employee, error: fetchError } = await supabase
      .from("employees")
      .select("total_leaves")
      .eq("id", employeeId)
      .single();

    if (fetchError) throw fetchError;
    if (!employee?.total_leaves) {
      throw new Error("Employee leave data not found");
    }

    const totalLeaves = { ...employee.total_leaves };

    const fraction = Number(dayFraction);

    let leaveAmount;

    if (fraction === 0.5) {
      leaveAmount = 0.5;
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);

      leaveAmount =
        Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    const leaveTypeMap = {
      Annual: "annualLeave",
      "Annual Appeal": "annualLeave", // ✅ FIX
      Medical: "medicalLeave",
      Compassionate: "compassionateLeave",
      Hospitalisation: "hospitalisationLeave",
    };

    const leaveKey = leaveTypeMap[leaveType];

    if (!leaveKey || !totalLeaves[leaveKey]) {
      console.warn("⚠️ Unknown leave type:", leaveType);
      return;
    }

    const currentRemaining = Number(totalLeaves[leaveKey].remaining || 0);
    const currentUsed = Number(totalLeaves[leaveKey].used || 0);

    if (mode === "refund") {
      totalLeaves[leaveKey].remaining = currentRemaining + leaveAmount;
      totalLeaves[leaveKey].used = Math.max(0, currentUsed - leaveAmount);
    } else {
      totalLeaves[leaveKey].remaining = Math.max(
        0,
        currentRemaining - leaveAmount
      );
      totalLeaves[leaveKey].used = currentUsed + leaveAmount;
    }

    const { error: updateError } = await supabase
      .from("employees")
      .update({ total_leaves: totalLeaves })
      .eq("id", employeeId);

    if (updateError) throw updateError;

    console.log(
      mode === "refund"
        ? `✅ Leave refunded: +${leaveAmount} (${leaveType})`
        : `✅ Leave deducted: -${leaveAmount} (${leaveType})`
    );
  } catch (err) {
    console.error("❌ Error updating leave balance:", err.message);
    throw err;
  }
}