import { useState } from "react";
import styles from "./ImageUploader.module.scss";

export default function ImageUploader({ images, setImages, uploadFn }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadError("");

    try {
      const uploaded = [];
      for (const file of files) uploaded.push(await uploadFn(file));
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setUploadError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (publicId) =>
    setImages((prev) => prev.filter((x) => x.publicId !== publicId));

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <div className={styles.title}>Images</div>
          <div className={styles.hint}>Upload thẳng Cloudinary (signed).</div>
        </div>

        <label className={styles.btn}>
          {uploading ? "Uploading..." : "+ Upload"}
          <input
            className={styles.file}
            type="file"
            accept="image/*"
            multiple
            onChange={onPickFiles}
            disabled={uploading}
          />
        </label>
      </div>

      {uploadError && <div className={styles.error}>{uploadError}</div>}

      {images?.length ? (
        <div className={styles.grid}>
          {images.map((img) => (
            <div className={styles.item} key={img.publicId || img.url}>
              <img className={styles.img} src={img.url} alt="" />
              <button type="button" className={styles.rm} onClick={() => removeImage(img.publicId)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>Chưa có ảnh nào.</div>
      )}
    </div>
  );
}
