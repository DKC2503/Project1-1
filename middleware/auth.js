const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = {
    verifyToken: async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            console.log(`[AUTH] Authorization Header:`, authHeader ? 'Present' : 'Missing');

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Authentication required. Access denied.' });
            }

            const token = authHeader.split(' ')[1];
            if (!process.env.JWT_SECRET) {
                console.error('CRITICAL: JWT_SECRET environment variable is missing.');
                process.exit(1);
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id);

            if (!user) {
                console.log(`[AUTH] User not found for ID: ${decoded.id}`);
                return res.status(401).json({ error: 'User no longer exists.' });
            }

            if (!user.isActive) {
                console.log(`[AUTH] User disabled: ${user.email}`);
                return res.status(403).json({ error: 'Account disabled. Contact administration.' });
            }

            console.log(`[AUTH] Decoded user: ${user.email} | Role: ${user.role}`);
            req.user = user;
            next();
        } catch (err) {
            console.log(`[AUTH] Token Verification Failed: ${err.message}`);
            return res.status(401).json({ error: 'Invalid or expired session token.' });
        }
    },

    authorize: (roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Insufficient clearance level.' });
            }
            next();
        };
    },

    requireAdmin: (req, res, next) => {
        if (!['admin', 'super_admin'].includes(req.user.role)) {
            console.log(`[AUTH] Admin clearance denied for: ${req.user.role}`);
            return res.status(403).json({ error: 'Admin clearance required.' });
        }
        next();
    },

    requireSuperAdmin: (req, res, next) => {
        if (req.user.role !== 'super_admin') {
            console.log(`[AUTH] Super Admin clearance denied for: ${req.user.role}`);
            return res.status(403).json({ error: 'Super Admin clearance required.' });
        }
        next();
    },

    requireEditor: (req, res, next) => {
        if (!['editor', 'admin', 'super_admin'].includes(req.user.role)) {
            console.log(`[AUTH] Editor clearance denied for: ${req.user.role}`);
            return res.status(403).json({ error: 'Editor clearance required.' });
        }
        next();
    },

    requireReviewer: (req, res, next) => {
        if (!['reviewer', 'admin', 'super_admin'].includes(req.user.role)) {
            console.log(`[AUTH] Reviewer clearance denied for: ${req.user.role}`);
            return res.status(403).json({ error: 'Reviewer clearance required.' });
        }
        next();
    }
};

module.exports = authMiddleware;
