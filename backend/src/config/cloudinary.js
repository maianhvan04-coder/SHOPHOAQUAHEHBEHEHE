const cloudinary = require("cloudinary").v2;
require("dotenv").config()
cloudinary.config({
  cloud_name: "dldz6chue",
  api_key: process.env.CLOUDINARYKEY,
  api_secret: process.env.CLOUDINARYSECRET,
});
module.exports = cloudinary;
