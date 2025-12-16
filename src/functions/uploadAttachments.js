import supabase from "./supabase";

export async function uploadAttachment(employeeId, file) {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${employeeId}/${fileName}`;

    const { error } = await supabase.storage
      .from("attachments")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        metadata: {
          employee_id: employeeId, // 🔐 REQUIRED for RLS
        },
      });

    if (error) throw error;

    // ✅ RETURN PATH, NOT URL
    return {
      name: file.name,
      path: filePath,
    };
  } catch (error) {
    console.error("Upload failed:", error.message);
    throw error;
  }
}
