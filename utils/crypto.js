const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.createHash('sha256').update(process.env.JWT_SECRET || 'newspercent_matrix_core_v1_secure_key_2026').digest();
const IV_LENGTH = 16;

/**
 * Encrypts cleartext using AES-256-CBC.
 * 
 * @param {string} text Plaintext to encrypt.
 * @returns {string} The iv and encrypted content as hex separated by a colon.
 */
function encrypt(text) {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts hex string back into cleartext.
 * 
 * @param {string} text Ciphertext to decrypt.
 * @returns {string|null} The decrypted cleartext, or null if decryption fails.
 */
function decrypt(text) {
    if (!text) return text;
    try {
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = parts.join(':');
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        console.error('[Crypto] Decryption failed:', err);
        return null;
    }
}

module.exports = { encrypt, decrypt };
