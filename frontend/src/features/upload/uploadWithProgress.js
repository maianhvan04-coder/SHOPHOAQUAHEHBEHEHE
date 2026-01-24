export function uploadWithProgress(url, formData, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", url);

        xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable) return;
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress?.(percent);
        };

        xhr.onload = () => {
            try {
                const json = JSON.parse(xhr.responseText);
                if (xhr.status >= 400) {
                    reject(json?.error?.message || "Upload thất bại");
                } else {
                    resolve(json);
                }
            } catch {
                reject("Response không hợp lệ");
            }
        };

        xhr.onerror = () => reject("Network error");

        xhr.send(formData);
    });
}
