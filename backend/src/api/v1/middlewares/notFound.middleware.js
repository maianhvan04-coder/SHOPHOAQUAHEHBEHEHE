const ApiError = require("../../../core/ApiError");
const httpStatus = require("../../../core/httpStatus");

exports.notFoundMiddleware = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, `Route ${req.originalUrl} not found`));
};
