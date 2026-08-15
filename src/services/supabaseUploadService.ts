import { UploadResult, UploadService } from "./uploadService";

export class SupabaseUploadService implements UploadService {
  async uploadFile(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    if (onProgress) onProgress(30);

    let type: "image" | "video" | "audio" = "image";
    if (file.type.startsWith("video")) type = "video";
    if (file.type.startsWith("audio")) type = "audio";

    // Simulate direct browser to Cloudflare R2 upload
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (onProgress) onProgress(80);

    const objectUrl = URL.createObjectURL(file);

    if (onProgress) onProgress(100);

    return {
      url: objectUrl,
      filename: file.name,
      sizeBytes: file.size,
      type,
    };
  }
}

export const supabaseUploadService = new SupabaseUploadService();
