const verifyRole = require('../middlewares/authorization');

describe('authorization middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: {}
        };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should allow Admin role', () => {
        req.user.role = 'Admin';

        verifyRole(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.access).toBeUndefined();
    });

    it('should allow familyMember role and set access', () => {
        req.user = { role: 'familyMember', id: 123 };

        verifyRole(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.access).toBe(123);
    });

    it('should throw error for unauthorized roles', () => {
        req.user.role = 'Guest';

        verifyRole(req, res, next);

        expect(next).toHaveBeenCalledWith({
            name: 'notAdmin',
            message: 'Forbidden Error'
        });
    });

    it('should handle errors gracefully', () => {
        req.user = null;

        verifyRole(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});