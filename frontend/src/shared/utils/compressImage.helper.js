import imageCompression from "browser-image-compression";

/**
 * Compress + convert image to WebP / AVIF
 */
export async function compressImage(file, {
    maxSizeMB = 0.5,
    maxWidthOrHeight = 1600,
    format = "image/webp", // image/webp | image/avif
} = {}) {
    const compressed = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
        fileType: format,
    });

    return compressed;
}
