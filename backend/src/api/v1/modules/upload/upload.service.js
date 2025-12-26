const cloudinary = require("cloudinary").v2;
const ApiError = require("../../../../core/ApiError");
const httpStatus = require("../../../../core/httpStatus");

const ALLOWED_FOLDERS = {
    product: "fruit-shop/products",
    avatar: "fruit-shop/avatars",
};

exports.getCloudinarySignature = ({ type = "product", productId }) => {
    const folder = ALLOWED_FOLDERS[type];
    if (!folder) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid upload type");

    const timestamp = Math.floor(Date.now() / 1000);


    const public_id = productId
        ? `product_${productId}_${Date.now()}`
        : `upload_${Date.now()}`;

    const paramsToSign = {
        folder,
        public_id,
        timestamp,

    };

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        signature,
        folder,
        publicId: public_id,
    };
};
