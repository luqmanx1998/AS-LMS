import supabase from "./supabase";

export async function getLeaveData() {
  const { data: leaves, error } = await supabase
    .from('leaves')
    .select(`
      *,
      employees(full_name, department)
    `);

  if (error) {
    console.error(error);
    throw new Error("Failed to load leave data.");
  }

  return leaves;
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
  .from('leaves')
  .update({ status: payload.status,
   remarks: payload.remarks,
   updated_at: new Date().toISOString(),
   })
  .eq('id', payload.id)
  .select();

   if (error) {
    console.error('Error updating leave:', error);
  } else {
    console.log('Leave updated successfully:', data);
  }

  return { data, error };
 
}