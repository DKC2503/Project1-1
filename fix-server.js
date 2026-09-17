const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

// 1. Add helmet and rate-limit requires
content = content.replace(
    "const express = require('express');",
    "const express = require('express');\nconst helmet = require('helmet');\nconst rateLimit = require('express-rate-limit');"
);

// 2. Add helmet and rate-limit middleware
content = content.replace(
    "const app = express();",
    "const app = express();\napp.use(helmet());\nconst authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });\nconst apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });\napp.use('/api/auth', authLimiter);\napp.use('/api', apiLimiter);"
);

// 3. Fix CORS catch-all
content = content.replace(
    /if \(allowedOrigins\.length === 0\) \{\s*return callback\(null, true\);\s*\}\s*return callback\(null, true\);\s*\}/,
    "if (allowedOrigins.length === 0) {\n      return callback(null, true);\n    }\n    return callback(new Error('Not allowed by CORS'));\n  }"
);

// 4. Fix upload.single('file') multer config
content = content.replace(
    "const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });",
    "const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => { if (file.mimetype.startsWith('image/')) cb(null, true); else cb(new Error('Only images are allowed')); } });"
);

// 5. Fix POST /api/articles/:id/like missing verifyToken and error leakage
content = content.replace(
    "app.post('/api/articles/:id/like', async (req, res) => {",
    "app.post('/api/articles/:id/like', verifyToken, async (req, res) => {"
);
content = content.replace(
    /res\.status\(500\)\.json\(\{\s*error:\s*'Like Article Error',\s*details:\s*err\.message,\s*stack:\s*err\.stack\s*\}\);/g,
    "handleError(res, err, 'Like Article Error');"
);

// 6. Fix DELETE /api/articles/:id/like missing verifyToken
content = content.replace(
    "app.delete('/api/articles/:id/like', async (req, res) => {",
    "app.delete('/api/articles/:id/like', verifyToken, async (req, res) => {"
);

// 7. Fix GET /api/articles IDOR
content = content.replace(
    "app.get('/api/articles', verifyToken, async (req, res) => {",
    "app.get('/api/articles', verifyToken, requireEditor, async (req, res) => {"
);

// 8. Fix Mass Assignment: Object.assign(targetUser, req.body);
content = content.replace(
    "Object.assign(targetUser, req.body);",
    "['name', 'bio', 'isActive', 'role'].forEach(k => { if (req.body[k] !== undefined) targetUser[k] = req.body[k]; });"
);

// 9. Fix Mass Assignment: Object.assign(article, req.body);
content = content.replace(
    /Object\.assign\(article, req\.body\);/g,
    "['title', 'subtitle', 'content', 'category', 'featuredImage', 'status', 'revisionMessage', 'reviewComments'].forEach(k => { if (req.body[k] !== undefined) article[k] = req.body[k]; });"
);

// 10. Fix POST /api/articles Mass Assignment
content = content.replace(
    /create\(\{\s*\.\.\.req\.body,/g,
    "create({\n            title: req.body.title, subtitle: req.body.subtitle, content: req.body.content, category: req.body.category, featuredImage: req.body.featuredImage, status: req.body.status,"
);

// 11. Fix GET /api/news DoS via req.query.category.toLowerCase()
content = content.replace(
    "else if (req.query.category && req.query.category.toLowerCase() === 'breaking')",
    "else if (req.query.category && typeof req.query.category === 'string' && req.query.category.toLowerCase() === 'breaking')"
);
content = content.replace(
    "else if (req.query.category && req.query.category !== 'Home')",
    "else if (req.query.category && typeof req.query.category === 'string' && req.query.category !== 'Home')"
);

// 12. Fix Hardcoded API Keys
content = content.replace(
    /\|\| '71e7436123ba4731a9b191053261906'/g,
    ""
);
content = content.replace(
    /\|\| 'goldapi-e534f854ad9d063b91a413673b705ee7-io'/g,
    ""
);
content = content.replace(
    /\|\| 'sk-live-kL3JzfGtjyqvUIYFxHDAHZuadiFiQjyTMt8nO0bG'/g,
    ""
);

fs.writeFileSync('server.js', content, 'utf8');
console.log('Fixed server.js');
