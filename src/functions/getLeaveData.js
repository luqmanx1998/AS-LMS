import supabase from "./supabase";

export async function getLeaveData(page = null, limit = null) {
  let query = supabase
    .from("leaves")
    .select(
      `
      *,
      employees(full_name, department)
    `,
      page !== null ? { count: "exact" } : undefined
    )
    .order("created_at", { ascending: false });

  if (page !== null && limit !== null) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);
  }

  const { data, error, count } = await query;
  if (error) throw new Error("Failed to load leave data.");

  return page !== null
    ? { leaves: data || [], total: count || 0 }
    : data || [];
}

// ======================================================
// SUBMIT LEAVE + ADMIN EMAIL
// ======================================================
export async function upsertLeaveData(payload) {
  const { data, error } = await supabase
    .from("leaves")
    .upsert([payload])
    .select(`*, employees(full_name, email)`)
    .single();

  if (error) throw new Error("Failed to submit leave.");

  const { data: admins } = await supabase
    .from("employees")
    .select("email")
    .eq("role", "admin");

  const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];

  if (adminEmails.length) {
    await supabase.functions.invoke("send-email", {
  body: {
    to: adminEmails,
    employeeName: data.employees.full_name,
    leaveType: data.leave_type,
    startDate: data.start_date,
    endDate: data.end_date,
    status: "Pending",
    remarks: data.remarks || "",
    adminNotification: true,

    // ⭐ REQUIRED FOR HALF-DAY DISPLAY
    dayFraction: data.day_fraction,
    halfDayPeriod: data.half_day_period,
  },
});

  }

  return data;
}

// ======================================================
// REVIEW ACTION
// ======================================================
export async function updateLeaveData(payload) {
  const { data, error } = await supabase
    .from("leaves")
    .update({
      status: payload.status,
      remarks: payload.remarks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)
    .select(`*, employees(email, full_name)`)
    .single();

  if (error) throw error;

  await supabase.functions.invoke("send-email", {
  body: {
    to: data.employees.email,
    employeeName: data.employees.full_name,
    leaveType: data.leave_type,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    remarks: data.remarks,

    // ⭐ REQUIRED FOR HALF-DAY DISPLAY
    dayFraction: data.day_fraction,
    halfDayPeriod: data.half_day_period,
  },
  });

  return data;
}

export async function cancelLeave(id) {
  const { data, error } = await supabase
    .from("leaves")
    .update({
      status: "Cancelled",
      remarks: "Cancelled by employee",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function getLeaveDisplayLabel(leave) {
  if (
    leave.leave_type === "Annual" &&
    Number(leave.day_fraction) === 0.5
  ) {
    return `Annual Leave (Half-Day${leave.half_day_period ? ` – ${leave.half_day_period}` : ""})`;
  }

  return `${leave.leave_type} Leave`;
}

// ======================================================
// GET LEAVES BY EMPLOYEE (FOR VIEW HISTORY MODAL)
// ======================================================
export async function getLeavesByEmployee(employeeId) {
  if (!employeeId) return [];

  const { data, error } = await supabase
    .from("leaves")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch employee leave history:", error.message);
    throw new Error("Failed to load leave history.");
  }

  return data || [];
}
