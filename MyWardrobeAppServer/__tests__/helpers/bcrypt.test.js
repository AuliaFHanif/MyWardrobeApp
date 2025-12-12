const { hashPassword, comparePassword } = require('../../helpers/bcrypt');

jest.mock('bcrypt', () => ({
    genSaltSync: jest.fn(),
    hashSync: jest.fn(),
    compareSync: jest.fn()
}));

const bcrypt = require('bcrypt');

describe('bcrypt helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('hashPassword', () => {
        it('should hash password successfully', () => {
            const password = 'password123';
            const salt = 'mock-salt';
            const hashedPassword = 'hashed-password';

            bcrypt.genSaltSync.mockReturnValue(salt);
            bcrypt.hashSync.mockReturnValue(hashedPassword);

            const result = hashPassword(password);

            expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10);
            expect(bcrypt.hashSync).toHaveBeenCalledWith(password, salt);
            expect(result).toBe(hashedPassword);
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching passwords', () => {
            const password = 'password123';
            const hashedPassword = 'hashed-password';

            bcrypt.compareSync.mockReturnValue(true);

            const result = comparePassword(password, hashedPassword);

            expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });

        it('should return false for non-matching passwords', () => {
            const password = 'password123';
            const hashedPassword = 'hashed-password';

            bcrypt.compareSync.mockReturnValue(false);

            const result = comparePassword(password, hashedPassword);

            expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(false);
        });
    });
});