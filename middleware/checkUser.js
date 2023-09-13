const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
    try {
        const token = req.header('auth-token');
        if(!token) {
        res.status(401).json({status: "Error", message: "Authentication Failed"});
        }
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (err) {
        res.status(401).json({status: "Error", message: "Authentication Failed"});
    }
}

module.exports = fetchUser;