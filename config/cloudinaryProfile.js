const cloudinary = require('cloudinary').v2;

const config = {
    cloud_name: process.env.PROFILE_CLOUDINARY_CLOUD_NAME || process.env.PROFILE_CLOUD_NAME,
    api_key: process.env.PROFILE_CLOUDINARY_API_KEY || process.env.PROFILE_API_KEY,
    api_secret: process.env.PROFILE_CLOUDINARY_API_SECRET || process.env.PROFILE_API_SECRET
};

console.log("Current Cloudinary Connected");

module.exports = {
    cloudinary,
    config
};
