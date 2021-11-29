const jwt = require('jsonwebtoken');

console.log('auth token: ' + jwt.sign('nix', process.env.ACCESS_TOKEN_SECRET));

const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                throw {status: 401, message: 'Authentication failed!'}
            }
            req.payload = payload;
            next();
        });
    }
    catch (error) {
        throw {status: 401, message: 'Authentication failed!'}
    }
}

module.exports = authenticate;