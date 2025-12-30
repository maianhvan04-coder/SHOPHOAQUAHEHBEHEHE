export async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);
  // form.append("folder", "DUANHOAQUA/avatars"); // nếu preset chưa set folder

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Upload failed");

  // data.secure_url, data.public_id
  return { url: data.secure_url, publicId: data.public_id };
}
