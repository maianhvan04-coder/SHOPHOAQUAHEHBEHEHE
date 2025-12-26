const cloudinary = require("../config/cloudinary")

exports.uploadAvatarBuffer = (buffer, userId) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: "fruit-shop/avatars",
            resource_type: "image",
            public_id: `avatar_${userId}_${Date.now()}`,
            overwrite: true,
            transformation: [
                { width: 256, height: 256, crop: "fill" },
                { quality: "auto" },
                { fetch_format: "auto" },
            ]

        },
            (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            });
        stream.end(buffer)
    })
}

exports.destroyByPublicId = (publicId) => {
    return cloudinary.uploader.destroy(publicId);
};