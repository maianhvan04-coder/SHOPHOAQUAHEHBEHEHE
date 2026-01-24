import { getUploadSignature } from "~/api/uploadApi";
import { compressImage } from "~/shared/utils/compressImage.helper";
import { uploadWithProgress } from "./uploadWithProgress";

function pickDT(resData) {
    return resData?.DT || resData?.data || resData;
}

export async function uploadToCloudinarySigned(
    file,
    {
        type = "product",
        productId,
        onProgress,
        format = "image/webp",
    } = {}
) {
    if (!file) throw new Error("Không có file để upload");

    // NÉN + CONVERT
    const compressedFile = await compressImage(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1600,
        format,
    });

    const sigRes = await getUploadSignature({ type, productId });
    const sig = pickDT(sigRes);

    const cloudName = sig.cloudName || sig.cloud_name;
    const apiKey = sig.apiKey || sig.api_key;
    const timestamp = sig.timestamp;
    const signature = sig.signature;
    const folder = sig.folder;
    const publicId = sig.publicId || sig.public_id;
    const resourceType = sig.resourceType || "image";

    const form = new FormData();
    form.append("file", compressedFile);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);


    if (folder) form.append("folder", folder);
    if (publicId) form.append("public_id", publicId);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const json = await uploadWithProgress(url, form, onProgress);

    return {
        url: json.secure_url || json.url,
        publicId: json.public_id,
        width: json.width,
        height: json.height,
    };
}
