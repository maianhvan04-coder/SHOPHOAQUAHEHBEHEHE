import { getUploadSignature } from "~/api/uploadApi";

import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

function pickDT(resData) {
    // Hỗ trợ nhiều format:
    // - { EC, EM, DT: {...} }
    // - { data: {...} }
    // - { ... }
    return resData?.DT || resData?.data || resData;
}

export async function uploadToCloudinarySigned(file, { type = "product", productId } = {}) {
    if (!file) throw new Error("Không có file để upload");

    const sigRes = await getUploadSignature({ type, productId });
    const sig = pickDT(sigRes);

    const cloudName = sig.cloudName || sig.cloud_name;
    const apiKey = sig.apiKey || sig.api_key;
    const timestamp = sig.timestamp;
    const signature = sig.signature;
    const folder = sig.folder;
    const publicId = sig.publicId || sig.public_id;     // ✅ lấy publicId từ backend
    const resourceType = sig.resourceType || sig.resource_type || "image";

    if (!cloudName || !apiKey || !timestamp || !signature) {
        throw new Error("Thiếu dữ liệu ký upload từ backend (cloudName/apiKey/timestamp/signature).");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    if (folder) form.append("folder", folder);

    //  QUAN TRỌNG: backend ký public_id thì frontend PHẢI gửi public_id
    if (publicId) form.append("public_id", publicId);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const resp = await fetch(url, { method: "POST", body: form });
    const json = await resp.json();

    if (!resp.ok) throw new Error(json?.error?.message || "Upload Cloudinary thất bại");

    return {
        url: json.secure_url || json.url,
        publicId: json.public_id,
        width: json.width,
        height: json.height,
    };
}

