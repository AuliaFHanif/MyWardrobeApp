const { signToken, verifyToken } = require('../../helpers/jwt');

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn()
}));

const jwt = require('jsonwebtoken');

describe('jwt helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_KEY = 'test-secret-key';
    });

    describe('signToken', () => {
        it('should sign token successfully', () => {
            const data = { id: 1, role: 'Admin' };
            const token = 'signed-token';

            jwt.sign.mockReturnValue(token);

            const result = signToken(data);

            expect(jwt.sign).toHaveBeenCalledWith(data, 'test-secret-key');
            expect(result).toBe(token);
        });
    });

    describe('verifyToken', () => {
        it('should verify token successfully', () => {
            const token = 'valid-token';
            const decoded = { id: 1, role: 'Admin' };

            jwt.verify.mockReturnValue(decoded);

            const result = verifyToken(token);

            expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
            expect(result).toEqual(decoded);
        });

        it('should throw error for invalid token', () => {
            const token = 'invalid-token';
            const error = new Error('Invalid token');

            jwt.verify.mockImplementation(() => {
                throw error;
            });

            expect(() => verifyToken(token)).toThrow('Invalid token');
        });
    });
});