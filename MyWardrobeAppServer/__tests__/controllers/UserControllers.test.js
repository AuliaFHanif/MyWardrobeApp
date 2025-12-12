const Users = require('../controllers/UserControllers');
const { User } = require('../models');
const { comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');
const { OAuth2Client } = require('google-auth-library');

jest.mock('../models');
jest.mock('../helpers/bcrypt');
jest.mock('../helpers/jwt');
jest.mock('google-auth-library');

describe('UserControllers', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();
    });

    describe('googleSignIn', () => {
        it('should sign in existing user with Google', async () => {
            const mockToken = 'mock-google-token';
            const mockPayload = {
                email: 'test@example.com',
                given_name: 'Test',
                family_name: 'User'
            };
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                role: 'familyMember'
            };
            const mockAccessToken = 'mock-jwt-token';

            req.body.googleAccessToken = mockToken;

            const mockVerifyIdToken = jest.fn().mockResolvedValue({
                getPayload: () => mockPayload
            });

            OAuth2Client.mockImplementation(() => ({
                verifyIdToken: mockVerifyIdToken
            }));

            User.findOne.mockResolvedValue(mockUser);
            signToken.mockReturnValue(mockAccessToken);

            await Users.googleSignIn(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ access_token: mockAccessToken });
        });

        it('should create new user and sign in with Google', async () => {
            const mockToken = 'mock-google-token';
            const mockPayload = {
                email: 'newuser@example.com',
                given_name: 'New',
                family_name: 'User'
            };
            const mockUser = {
                id: 2,
                email: 'newuser@example.com',
                role: 'familyMember'
            };
            const mockAccessToken = 'mock-jwt-token';

            req.body.googleAccessToken = mockToken;

            const mockVerifyIdToken = jest.fn().mockResolvedValue({
                getPayload: () => mockPayload
            });

            OAuth2Client.mockImplementation(() => ({
                verifyIdToken: mockVerifyIdToken
            }));

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(mockUser);
            signToken.mockReturnValue(mockAccessToken);

            await Users.googleSignIn(req, res, next);

            expect(User.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ access_token: mockAccessToken });
        });

        it('should return 400 if token is missing', async () => {
            req.body.googleAccessToken = null;

            await Users.googleSignIn(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Google token is required' });
        });

        it('should handle errors', async () => {
            const error = new Error('Google auth error');
            req.body.googleAccessToken = 'invalid-token';

            const mockVerifyIdToken = jest.fn().mockRejectedValue(error);

            OAuth2Client.mockImplementation(() => ({
                verifyIdToken: mockVerifyIdToken
            }));

            await Users.googleSignIn(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User'
            };

            req.body = {
                email: 'test@example.com',
                password: 'password123',
                first_name: 'Test',
                last_name: 'User'
            };

            User.create.mockResolvedValue(mockUser);

            await Users.createUser(req, res, next);

            expect(User.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: mockUser.id,
                email: mockUser.email,
                name: 'Test User'
            });
        });

        it('should handle errors during user creation', async () => {
            const error = new Error('Validation error');
            req.body = { email: 'test@example.com' };

            User.create.mockRejectedValue(error);

            await Users.createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password_hash: 'hashed-password',
                role: 'familyMember'
            };
            const mockAccessToken = 'mock-jwt-token';

            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue(mockUser);
            comparePassword.mockReturnValue(true);
            signToken.mockReturnValue(mockAccessToken);

            await Users.login(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(comparePassword).toHaveBeenCalledWith('password123', 'hashed-password');
            expect(signToken).toHaveBeenCalledWith({ id: 1, role: 'familyMember' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ access_token: mockAccessToken });
        });

        it('should throw error if email is missing', async () => {
            req.body = { password: 'password123' };

            await Users.login(req, res, next);

            expect(next).toHaveBeenCalledWith({
                name: 'BadRequest',
                message: 'Email is required'
            });
        });

        it('should throw error if password is missing', async () => {
            req.body = { email: 'test@example.com' };

            await Users.login(req, res, next);

            expect(next).toHaveBeenCalledWith({
                name: 'BadRequest',
                message: 'Password is required'
            });
        });

        it('should throw error if user not found', async () => {
            req.body = {
                email: 'notfound@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue(null);

            await Users.login(req, res, next);

            expect(next).toHaveBeenCalledWith({
                name: 'Unauthorized',
                message: 'Wrong username or password'
            });
        });

        it('should throw error if password is invalid', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password_hash: 'hashed-password',
                role: 'familyMember'
            };

            req.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            User.findOne.mockResolvedValue(mockUser);
            comparePassword.mockReturnValue(false);

            await Users.login(req, res, next);

            expect(next).toHaveBeenCalledWith({
                name: 'Unauthorized',
                message: 'Wrong username or password'
            });
        });
    });
});