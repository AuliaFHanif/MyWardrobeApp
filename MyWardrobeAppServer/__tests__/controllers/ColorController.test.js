const ColorController = require('../../controllers/ColorController');

jest.mock('../../models', () => ({
    Color: {
        findAll: jest.fn()
    }
}));

const { Color } = require('../../models');

describe('ColorController', () => {
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

    describe('getAllColors', () => {
        it('should return all colors with status 200', async () => {
            const mockColors = [
                { id: 1, color_name: 'Red', hex_code: '#FF0000' },
                { id: 2, color_name: 'Blue', hex_code: '#0000FF' }
            ];

            Color.findAll.mockResolvedValue(mockColors);

            await ColorController.getAllColors(req, res, next);

            expect(Color.findAll).toHaveBeenCalledWith({
                attributes: ['id', 'color_name', 'hex_code']
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockColors);
        });

        it('should handle errors and return status 500', async () => {
            const error = new Error('Database error');
            Color.findAll.mockRejectedValue(error);

            await ColorController.getAllColors(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: error.message });
        });
    });
});