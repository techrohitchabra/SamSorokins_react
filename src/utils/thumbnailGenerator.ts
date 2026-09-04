/**
 * Utility to generate a lightweight JPEG thumbnail from a File object (Image or Video)
 */

export async function generateClientThumbnail(
  file: File,
  maxWidth = 500
): Promise<Blob | null> {
  if (file.type.startsWith("image/")) {
    return generateImageThumbnail(file, maxWidth);
  } else if (file.type.startsWith("video/")) {
    return generateVideoThumbnail(file, maxWidth);
  }
  return null;
}

async function generateImageThumbnail(
  file: File,
  maxWidth: number
): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);

    let width = bitmap.width;
    let height = bitmap.height;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(bitmap, 0, 0, width, height);

    return await canvas.convertToBlob({ type: "image/jpeg", quality: 0.7 });
  } catch (error) {
    console.error("Failed to generate image thumbnail client-side:", error);
    return null;
  }
}

async function generateVideoThumbnail(
  file: File,
  maxWidth: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);

      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      // Seek to 0.1s to avoid black frames at the very start
      video.currentTime = 0.1;

      video.onloadeddata = () => {
        // Just in case it needs to buffer
        if (video.readyState >= 2) {
          extractFrame();
        }
      };

      video.onseeked = () => {
        extractFrame();
      };

      video.onerror = () => {
        console.error("Video error during thumbnail generation");
        URL.revokeObjectURL(url);
        resolve(null);
      };

      const extractFrame = () => {
        try {
          let width = video.videoWidth;
          let height = video.videoHeight;

          if (!width || !height) {
            URL.revokeObjectURL(url);
            return resolve(null);
          }

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(url);
            return resolve(null);
          }

          ctx.drawImage(video, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              resolve(blob);
            },
            "image/jpeg",
            0.7
          );
        } catch (err) {
          console.error("Error drawing video frame to canvas:", err);
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
    } catch (err) {
      console.error("Failed to setup video thumbnail generation:", err);
      resolve(null);
    }
  });
}
