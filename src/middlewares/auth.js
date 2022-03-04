// Modules
require('dotenv').config();
const status = require('http-status-codes');

// ENUM's
const statusKey = require('../utils/statusCode.enum');

module.exports = (req, res, next) => {
    const authToken = req.headers['authorization'];

    if (authToken) {
        const token = authToken.split(' ')[0];
        if(token === process.env.AUTH) {
            req.token = token;
            next();
        } else {
            return res.status(status.UNAUTHORIZED).json({
                status: res.statusCode,
                statusKey: statusKey.UNAUTHORIZED,
                message: 'Token inválido.'
            });
        }
        
    } else {
        return res.status(status.UNAUTHORIZED).json({
            status: res.statusCode,
            statusKey: statusKey.UNAUTHORIZED,
            message: 'Token inválido.'
        });
    }
}