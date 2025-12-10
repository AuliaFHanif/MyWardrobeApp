const jwt = require('jsonwebtoken')

const signToken = (data) => {
    return jwt.sign(data, process.env.JWT_KEY)
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_KEY)
}

module.exports = {
    signToken,
    verifyToken
}