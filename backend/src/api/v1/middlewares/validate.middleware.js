const ApiError = require("../../../core/ApiError");
const httpStatus = require("../../../core/httpStatus");

function pickField(path) {
  if (!Array.isArray(path)) return "unknown";
  return path.map(String).join(".");
}

exports.validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    // ✅ { "email": "...", "password": "..." }
    const errors = {};
    for (const d of error.details || []) {
      const field = pickField(d.path);
      if (!errors[field]) errors[field] = d.message.replace(/"/g, "");
    }

    return next(
      new ApiError(
        httpStatus.BAD_REQUEST,
        "Dữ liệu không hợp lệ",
        { errors },              // ✅ đúng format bạn muốn
        "VALIDATION_ERROR"
      )
    );
  }

  req.body = value;
  return next();
};
