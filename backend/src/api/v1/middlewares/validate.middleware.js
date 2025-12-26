const ApiError = require("../../../core/ApiError");
const httpStatus = require("../../../core/httpStatus");

function pickField(path) {
  // Joi path có thể là ['images', 0, 'url'] -> "images.0.url"
  if (!Array.isArray(path)) return "";
  return path.map(String).join(".");
}

exports.validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: pickField(d.path),
      message: d.message.replace(/"/g, ""), // bỏ dấu "
      type: d.type,                        // ví dụ: "string.uri", "any.required"
    }));

    return next(
      new ApiError(
        httpStatus.BAD_REQUEST,
        "Validation error",
        details,
        "VALIDATION_ERROR"
      )
    );
  }

  req.body = value;
  next();
};
