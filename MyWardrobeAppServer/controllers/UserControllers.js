const { User } = require("../models");
const { comparePassword } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();

class Users {

    static async googleSignIn(req, res, next) {
        try {
            const token = req.body.googleAccessToken;
            console.log('Received token:', token);
            
            if (!token) {
                return res.status(400).json({ message: 'Google token is required' });
            }
            
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            console.log('Google payload:', payload);
            
            const email = payload.email;
            
            let user = await User.findOne({ where: { email } });
            
            if (!user) {
                user = await User.create({
                    email: payload.email,
                    password_hash: Math.random().toString(36).slice(-256),
                    first_name: payload.given_name,
                    last_name: payload.family_name,
                    role: 'familyMember'
                });
            }
            
            const access_token = signToken({ id: user.id, role: user.role });
            res.status(200).json({ access_token });
            
        } catch (error) {
            console.error('Google sign-in error:', error);
            next(error);
        }
    }

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
            console.log(password,"<================");
            console.log(user.password_hash,'<---------------');
            
            const isValidPassword = comparePassword(password, user.password_hash)

            if (!isValidPassword) {
                throw { name: 'Unauthorized', message: 'Wrong username or password' }
            }

            const access_token = signToken({ id: user.id, role: user.role })

            res.status(200).json({ access_token })

        } catch (error) {
            // console.log(error);
            console.log(error);
            
            next(error)

        }
    }
}


module.exports = Users