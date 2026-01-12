import JSZip from "jszip";
import { saveAs } from "file-saver";
import supabase from "./supabase";

export async function downloadAttachments(attachments) {
  if (!attachments?.length) return;

  const zip = new JSZip();

  for (const file of attachments) {
    try {
      // ✅ Support BOTH formats:
      // NEW: { name, path }
      // OLD: { name, url: { name, path } }
      const path = file?.path ?? file?.url?.path;
      const name = file?.name ?? file?.url?.name ?? "attachment";

      if (!path) {
        console.warn("⚠️ Missing path for attachment:", file);
        continue;
      }

      // 🔑 Create signed URL
      const { data, error } = await supabase.storage
        .from("attachments")
        .createSignedUrl(path, 60 * 5);

      if (error) throw error;

      const res = await fetch(data.signedUrl);
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);

      const blob = await res.blob();
      zip.file(name, blob);
    } catch (err) {
      console.error("Failed to download:", file?.name, err);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "attachments.zip");
}
