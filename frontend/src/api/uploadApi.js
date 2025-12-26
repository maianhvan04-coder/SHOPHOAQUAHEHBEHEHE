import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export async function getUploadSignature({ type = "product", productId } = {}) {
    const res = await apiClient.post(endpoints.upload.signature, { type, productId });

    return res.data;
}
