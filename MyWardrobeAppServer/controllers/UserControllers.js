const { User } = require("../models");
const { comparePassword } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt');

class Users {
    static async createUser(req, res, next) {
        try {

            const user = await User.create(req.body);
            res.status(200).json({
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`

            });
        } catch (error) {


            next(error)

        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body
            if (!email) {
                throw { name: 'BadRequest', message: "Email is required" }
            }
            if (!password) {
                throw { name: 'BadRequest', message: "Password is required" }
            }
            const user = await User.findOne({ where: { email } })
            if (!user) {
                throw { name: 'Unauthorized', message: 'Wrong username or password' }
            }

            const isValidPassword = comparePassword(password, user.password)

            if (!isValidPassword) {
                throw { name: 'Unauthorized', message: 'Wrong username or password' }
            }

            const access_token = signToken({ id: user.id, role: user.role })

            res.status(200).json({ access_token })

        } catch (error) {
            // console.log(error);

            next(error)

        }
    }
}


module.exports = Users