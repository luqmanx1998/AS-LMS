import JSZip from "jszip";
import { saveAs } from "file-saver";
import supabase from "./supabase";

export async function downloadAttachments(attachments) {
  if (!attachments?.length) return;

  const zip = new JSZip();

  for (let file of attachments) {
    try {
      // 🔑 Create signed URL
      const { data, error } = await supabase.storage
        .from("attachments")
        .createSignedUrl(file.path, 60 * 5); // 5 minutes

      if (error) throw error;

      const res = await fetch(data.signedUrl);
      const blob = await res.blob();
      zip.file(file.name, blob);

    } catch (err) {
      console.error("Failed to download:", file.name, err);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "attachments.zip");
}
