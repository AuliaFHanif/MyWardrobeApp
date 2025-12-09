const { verifyToken } = require('../helpers/jwt')
const { User } = require('../models')

module.exports = async function authentication(req, res, next) {
    const bearerToken = req.headers.authorization

    if (!bearerToken) {
        throw { name: "Unauthorized", message: "Token is required" }
    }

    try {
        const accessToken = bearerToken.split(" ")[1]


        const data = verifyToken(accessToken)

        console.log("HERE", data);


        const user = await User.findByPk(data.id)

        if (!user) {

            throw { name: "JsonWebTokenError" }

        }

        req.user = user

        next()

    } catch (error) {

        next(error)

    }
}