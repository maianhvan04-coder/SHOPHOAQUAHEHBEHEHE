const mongoose = require("mongoose");
const ApiError = require("../core/apiError");
const httpStatus = require("../core/httpStatus");

module.exports = (id, name = "ID") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `${name} không hợp lệ`);
    }
};
