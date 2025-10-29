import supabase from "./supabase";

export async function getEmployees() {
    let { data: employees, error } = await supabase
  .from('employees')
  .select('*');

  if(error) {
    console.error(error.message);
    throw new Error("Loading employees failed");
  }

  return employees;

}