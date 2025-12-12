const errorHandler = require('../middlewares/errorHandler');

describe('errorHandler middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should handle BadRequest error', () => {
        const err = { name: 'BadRequest', message: 'Invalid input' };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid input' });
    });

    it('should handle Unauthorized error', () => {
        const err = { name: 'Unauthorized', message: 'Not authorized' };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });

    it('should handle SequelizeValidationError', () => {
        const err = {
            name: 'SequelizeValidationError',
            errors: [{ message: 'Validation failed' }]
        };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Validation failed' });
    });

    it('should handle SequelizeUniqueConstraintError', () => {
        const err = {
            name: 'SequelizeUniqueConstraintError',
            errors: [{ message: 'Email must be unique' }]
        };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email must be unique' });
    });

    it('should handle JsonWebTokenError', () => {
        const err = { name: 'JsonWebTokenError' };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should handle notAdmin error', () => {
        const err = { name: 'notAdmin', message: 'Forbidden Error' };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden Error' });
    });

    it('should handle emptyFile error', () => {
        const err = { name: 'emptyFile', message: 'File is empty' };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'File is empty' });
    });

    it('should handle unknown errors with 500', () => {
        const err = { name: 'UnknownError', message: 'Something went wrong' };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
});