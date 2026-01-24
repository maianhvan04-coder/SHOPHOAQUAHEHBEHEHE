import { uploadToCloudinarySigned } from "~/features/upload/cloudinaryUpload";

class CkUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    async upload() {
        const file = await this.loader.file;

        // 🔥 tái sử dụng uploadToCloudinarySigned
        const res = await uploadToCloudinarySigned(file, {
            type: "editor",
            format: "image/webp",
            onProgress: (p) => {
                this.loader.uploadTotal = 100;
                this.loader.uploaded = p;
            },
        });

        /**
         * CKEditor sẽ:
         * - dùng `default` để HIỂN THỊ ảnh NGAY
         * - nhưng khi getData(), attributes vẫn còn
         */
        return {
            default: res.url, // 🔥 HIỆN ẢNH TRONG EDITOR
            attributes: {
                "data-public-id": res.publicId, // 🔐 LƯU CÁI NÀY
                "data-width": res.width,
                "data-height": res.height,
            },
        };
    }

    abort() { }
}

export function CkUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
        return new CkUploadAdapter(loader);
    };
}
