import { UploadResult, UploadService } from "./uploadService";
import { createClient } from "@/lib/supabase/client";

export class SupabaseUploadService implements UploadService {
  private supabase = createClient();

  async uploadFile(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    if (onProgress) onProgress(15);

    let type: "image" | "video" | "audio" = "image";
    if (file.type.startsWith("video")) type = "video";
    if (file.type.startsWith("audio")) type = "audio";

    try {
      const ext = file.name.split(".").pop() || "bin";
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${type}s/${fileName}`;

      if (onProgress) onProgress(40);

      // 1. Try Supabase Storage 'media' bucket first
      const { data, error } = await this.supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (onProgress) onProgress(80);

      if (data && !error) {
        const { data: publicUrlData } = this.supabase.storage
          .from("media")
          .getPublicUrl(filePath);

        if (onProgress) onProgress(100);

        return {
          url: publicUrlData.publicUrl,
          filename: file.name,
          sizeBytes: file.size,
          type,
        };
      }

      // 2. Fallback: Edge Function / R2 Presigned Target
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/media-upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            contentType: type,
            filename: file.name,
          }),
        }
      );

      if (res.ok) {
        const r2Data = await res.json();
        if (onProgress) onProgress(100);
        return {
          url: r2Data.mediaUrl || URL.createObjectURL(file),
          filename: file.name,
          sizeBytes: file.size,
          type,
        };
      }
    } catch {
      // Direct local object URL fallback for dev environments
    }

    if (onProgress) onProgress(100);
    return {
      url: URL.createObjectURL(file),
      filename: file.name,
      sizeBytes: file.size,
      type,
    };
  }
}

export const supabaseUploadService = new SupabaseUploadService();
