import supabase from "./supabase";

export async function uploadAttachment(employeeId, file) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${employeeId}/${fileName}`;

    const { data, error } = await supabase.storage
  .from("attachments")
  .upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
  });


    if (error) throw error;

    // get public URL (optional)
    const { data: publicUrlData } = supabase.storage
      .from("attachments")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Upload failed:", error.message);
    throw error;
  }
}
