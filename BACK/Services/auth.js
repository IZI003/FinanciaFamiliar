const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'dev.env' });

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) return res.status(403).json({ message: 'Token no proporcionado' });

    // Quitar la palabra "Bearer " del token si está presente
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7, authHeader.length) : authHeader;

    jwt.verify(token, process.env.jwtSecret, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token inválido o expirado' });

        req.userId = decoded.userId;  // Añadir el ID del usuario a la request
        next();
    });
};

module.exports = authMiddleware;
