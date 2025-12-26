const multer = require("multer");
const ApiError = require("../../../../core/ApiError");
const httpStatus = require("../../../../core/httpStatus");

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_BYTES },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
            return cb(
                new ApiError(
                    httpStatus.BAD_REQUEST,
                    "File không hợp lệ (chỉ nhận jpg/png/webp)",
                    { allowed: ALLOWED_MIME, got: file.mimetype },
                    "INVALID_FILE_TYPE"
                )
            );
        }
        cb(null, true);
    },
});

/**
 * uploadAvatar("image") -> middleware
 * - Convert MulterError (LIMIT_FILE_SIZE) -> ApiError
 * - Invalid mimetype -> ApiError (từ fileFilter)
 */
function uploadAvatar(fieldName = "image", required = true) {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (!err) {
                if (required && !req.file) {
                    return next(
                        new ApiError(
                            httpStatus.BAD_REQUEST,
                            "Thiếu file ảnh",
                            null,
                            "FILE_REQUIRED"
                        )
                    );
                }
                return next();
            }

            // Nếu fileFilter trả ApiError
            if (err instanceof ApiError) return next(err);

            // Multer errors
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next(
                        new ApiError(
                            httpStatus.BAD_REQUEST,
                            `File quá lớn (tối đa ${Math.floor(MAX_BYTES / 1024 / 1024)}MB)`,
                            { maxBytes: MAX_BYTES },
                            "FILE_TOO_LARGE"
                        )
                    );
                }

                return next(
                    new ApiError(
                        httpStatus.BAD_REQUEST,
                        "Upload lỗi",
                        { code: err.code },
                        "UPLOAD_ERROR"
                    )
                );
            }

            // Lỗi khác
            return next(
                new ApiError(
                    httpStatus.BAD_REQUEST,
                    "Upload lỗi",
                    { message: err.message },
                    "UPLOAD_ERROR"
                )
            );
        });
    };
}

module.exports = { uploadAvatar };
