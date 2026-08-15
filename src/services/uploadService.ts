export interface UploadResult {
  url: string;
  filename: string;
  sizeBytes: number;
  type: "image" | "video" | "audio";
}

export interface UploadService {
  uploadFile(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult>;
}

class MockUploadService implements UploadService {
  async uploadFile(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    for (let progress = 10; progress <= 100; progress += 30) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (onProgress) onProgress(progress);
    }

    let type: "image" | "video" | "audio" = "image";
    if (file.type.startsWith("video")) type = "video";
    if (file.type.startsWith("audio")) type = "audio";

    // Create a local object URL for instant preview
    const previewUrl = URL.createObjectURL(file);

    return {
      url: previewUrl,
      filename: file.name,
      sizeBytes: file.size,
      type,
    };
  }
}

export const uploadService: UploadService = new MockUploadService();
