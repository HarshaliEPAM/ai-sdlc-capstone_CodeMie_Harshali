const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret && process.env.NODE_ENV !== 'test') {
            return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
        }
        const effectiveSecret = secret || 'qa-local-dev-secret';
        const decoded = jwt.verify(token, effectiveSecret);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};
 
