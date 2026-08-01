const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '..', 'logs');

// Create log directory if it doesn't exist
if (!fs.existsSync(logDirectory)) {
    try {
        fs.mkdirSync(logDirectory, { recursive: true });
    } catch (err) {
        console.error('Failed to create log directory:', err.message);
    }
}

let logStream;
if (process.env.NODE_ENV === 'production') {
    try {
        logStream = fs.createWriteStream(path.join(logDirectory, 'production.log'), { flags: 'a' });
    } catch (err) {
        console.error('Failed to initialize production log stream:', err.message);
    }
}

/**
 * Clean request logger middleware
 */
const logger = (req, res, next) => {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${ip} - ${method} ${originalUrl} - Status: ${statusCode} - ${duration}ms`;
        
        // Log to console
        console.log(logLine);
        
        // Log to file in production
        if (process.env.NODE_ENV === 'production' && logStream) {
            logStream.write(logLine + '\n');
        }
    });
    
    next();
};

/**
 * Standardized error logger
 */
const logError = (error, req = null, context = 'Server Error') => {
    const timestamp = new Date().toISOString();
    let logMsg = `[${timestamp}] [ERROR] [${context}] ${error.message || error}\n`;
    if (req) {
        logMsg += `  Request: ${req.method} ${req.originalUrl} from ${req.ip}\n`;
    }
    if (error.stack) {
        logMsg += `  Stack: ${error.stack}\n`;
    }
    logMsg += '--------------------------------------------------\n';
    
    // Log to console
    console.error(logMsg.trim());
    
    // Log to file in production
    if (process.env.NODE_ENV === 'production') {
        try {
            fs.appendFileSync(path.join(logDirectory, 'error.log'), logMsg);
        } catch (err) {
            console.error('Failed to write to error log file:', err.message);
        }
    }
};

module.exports = {
    logger,
    logError
};
