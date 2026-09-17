const { cloudinary } = require('../config/cloudinaryProfile');
const StorageConfig = require('../models/StorageConfig');
const { decrypt } = require('../utils/crypto');

/**
 * Retrieves the currently active Cloudinary configuration for profile images storage.
 * Decrypts the secret key stored in the database if present.
 * Falls back to environment variables if no database entry is set.
 */
const getActiveProfileConfig = async () => {
    try {
        const dbConfig = await StorageConfig.findOne({ purpose: { $in: ['Profile Images', 'profile'] }, status: 'ACTIVE' }).sort({ startDate: -1 });
        if (dbConfig) {
            const decryptedSecret = decrypt(dbConfig.apiSecret);
            if (decryptedSecret) {
                return {
                    cloud_name: dbConfig.cloudName,
                    api_key: dbConfig.apiKey,
                    api_secret: decryptedSecret,
                    source: 'Database (Active Profile Storage)'
                };
            }
        }
    } catch (err) {
        console.error('[UploadProfileImage] Error reading database config, falling back:', err);
    }
    
    // Fallback order: PROFILE_CLOUDINARY_... -> PROFILE_... -> CLOUDINARY_...
    const cloudName = process.env.PROFILE_CLOUDINARY_CLOUD_NAME || process.env.PROFILE_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.PROFILE_CLOUDINARY_API_KEY || process.env.PROFILE_API_KEY || process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.PROFILE_CLOUDINARY_API_SECRET || process.env.PROFILE_API_SECRET || process.env.CLOUDINARY_API_SECRET;

    return {
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        source: 'Environment Variables fallback'
    };
};

/**
 * Uploads a profile image buffer to the active profile Cloudinary account.
 * Logs diagnostic details on account selection, cloud names, and errors.
 * 
 * @param {Buffer} fileBuffer The image file buffer.
 * @param {string} folder The target folder path in Cloudinary.
 * @returns {Promise<object>} The Cloudinary upload result.
 */
const uploadProfileImage = async (fileBuffer, folder) => {
    const activeConfig = await getActiveProfileConfig();
    
    console.log('--- DIAGNOSTIC UPLOAD LOG ---');
    console.log('Upload Type: Profile Image');
    console.log('Selected Cloudinary Account Source:', activeConfig.source);
    console.log('Cloud Name:', activeConfig.cloud_name);
    console.log('API Key:', activeConfig.api_key ? '***' + activeConfig.api_key.slice(-4) : 'undefined');
    
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                cloud_name: activeConfig.cloud_name,
                api_key: activeConfig.api_key,
                api_secret: activeConfig.api_secret,
                folder, 
                resource_type: 'image' 
            },
            (error, result) => {
                if (error) {
                    console.error('[PROFILE UPLOAD ERROR] Cloudinary Error details:', error);
                    reject(error);
                } else {
                    console.log('[PROFILE UPLOAD SUCCESS] Upload result:', {
                        public_id: result.public_id,
                        secure_url: result.secure_url,
                        bytes: result.bytes
                    });
                    resolve(result);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

module.exports = uploadProfileImage;
