const authentication = require('../../middlewares/authentication');

jest.mock('../../helpers/jwt', () => ({
    verifyToken: jest.fn()
}));

jest.mock('../../models', () => ({
    User: {
        findByPk: jest.fn()
    }
}));

const { verifyToken } = require('../../helpers/jwt');
const { User } = require('../../models');

describe('authentication middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
        console.log = jest.fn();
    });

    it('should throw error if no authorization header', async () => {
        try {
            await authentication(req, res, next);
        } catch (error) {
            expect(error).toEqual({
                name: 'Unauthorized',
                message: 'Token is required'
            });
        }
    });

    it('should authenticate user successfully', async () => {
        const mockUser = { id: 1, email: 'test@example.com' };

        req.headers.authorization = 'Bearer valid-token';
        verifyToken.mockReturnValue({ id: 1 });
        User.findByPk.mockResolvedValue(mockUser);

        await authentication(req, res, next);

        expect(verifyToken).toHaveBeenCalledWith('valid-token');
        expect(User.findByPk).toHaveBeenCalledWith(1);
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
        req.headers.authorization = 'Bearer valid-token';
        verifyToken.mockReturnValue({ id: 999 });
        User.findByPk.mockResolvedValue(null);

        await authentication(req, res, next);

        expect(next).toHaveBeenCalledWith({ name: 'JsonWebTokenError' });
    });

    it('should handle token verification errors', async () => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';

        req.headers.authorization = 'Bearer invalid-token';
        verifyToken.mockImplementation(() => {
            throw error;
        });

        await authentication(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});