import supabase from "./supabase";

export async function getLeaveData(page = null, limit = null) {
  let query = supabase
    .from("leaves")
    .select(`
      *,
      employees(full_name, department)
    `, page !== null ? { count: "exact" } : undefined)
    .order("created_at", { ascending: false });

  if (page !== null && limit !== null) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);
  }

  const { data: leaves, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error("Failed to load leave data.");
  }

  console.log('🔍 getLeaveData debug:', { 
    page, 
    limit, 
    leavesCount: leaves?.length,
    returnType: page !== null ? 'OBJECT {leaves, total}' : 'ARRAY leaves',
    firstLeave: leaves?.[0] 
  });

  // ✅ FIX: Make this VERY clear
  if (page !== null) {
    return { leaves: leaves || [], total: count || 0 };
  } else {
    // ✅ This should return JUST the array
    return leaves || [];
  }
}

export async function upsertLeaveData(payload) {
    const { data, error } = await supabase
    .from('leaves')
    .upsert([payload])
    .select()

    if(error) {
        console.error("Upsert failed:", error.message);
        throw new Error("Failed to upsert leave data.")
    }

    return data;
}

export async function updateLeaveData(payload) {
  const { data, error } = await supabase
    .from("leaves")
    .update({
      status: payload.status,
      remarks: payload.remarks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)
    .select(`
      id,
      leave_type,
      start_date,
      end_date,
      status,
      remarks,
      employees ( email, full_name )
    `)
    .single();

  if (error) {
    console.error("❌ Error updating leave:", error);
    return { data, error };
  }

  console.log("✅ Leave updated successfully:", data);

  // Check if we have the necessary data for email
  if (!data.employees?.email) {
    console.error("❌ No employee email found:", data);
    return { data, error: new Error("No employee email found") };
  }

  try {
    console.log("📨 Calling Edge Function...");
    const { data: emailData, error: emailError } = await supabase.functions.invoke("send-email", {
      body: {
        to: data.employees.email,
        employeeName: data.employees.full_name,
        leaveType: data.leave_type,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        remarks: data.remarks,
      },
    });

    if (emailError) {
      console.error("❌ Edge Function error:", emailError);
    } else {
      console.log("📧 Edge Function response:", emailData);
    }

    return { data, emailError };
  } catch (edgeError) {
    console.error("❌ Edge Function invocation failed:", edgeError);
    return { data, error: edgeError };
  }
}


export async function getLeavesByEmployee(employeeId) {
  const { data: leaves, error } = await supabase
    .from("leaves")
    .select(`
      id,
      leave_type,
      start_date,
      end_date,
      status,
      created_at
    `)
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Failed to load leave history.");
  }

  return leaves;
}