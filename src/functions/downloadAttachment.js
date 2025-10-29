import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadAttachments(attachments) {
  if (!attachments?.length) return;

  const zip = new JSZip();

  for (let file of attachments) {
    try {
      const res = await fetch(file.url);
      const blob = await res.blob();
      zip.file(file.name, blob);
    } catch (err) {
      console.error("Failed to fetch file:", file.name, err);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "attachments.zip");
}
