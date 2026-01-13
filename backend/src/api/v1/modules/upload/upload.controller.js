const asyncHandler = require("../../../../core/asyncHandler");
const uploadService = require("./upload.service");

exports.getSignature = asyncHandler(async (req, res) => {
    const data = uploadService.getCloudinarySignature(req.body);
    res.json({ data });
});
exports.getFeedbackSignature = asyncHandler(async (req, res) => {
   
    const data = uploadService.getFeedbackUploadSignature(req.body);
    
    res.json({ data });
});