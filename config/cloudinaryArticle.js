const cloudinary = require('cloudinary').v2;

const config = {
    cloud_name: process.env.ARTICLE_CLOUD_NAME,
    api_key: process.env.ARTICLE_API_KEY,
    api_secret: process.env.ARTICLE_API_SECRET
};

console.log("New Cloudinary Connected");

module.exports = {
    cloudinary,
    config
};
