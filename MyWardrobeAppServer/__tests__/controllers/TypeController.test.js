const Types = require('../controllers/TypeController');
const { ClothingType } = require('../models');

jest.mock('../models');

describe('TypeController', () => {
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

    describe('getAllTypes', () => {
        it('should return all types with status 200', async () => {
            const mockTypes = [
                { id: 1, type_name: 'T-Shirt', category: 'Tops' },
                { id: 2, type_name: 'Jeans', category: 'Bottoms' }
            ];

            ClothingType.findAll.mockResolvedValue(mockTypes);

            await Types.getAllTypes(req, res, next);

            expect(ClothingType.findAll).toHaveBeenCalledWith({
                attributes: ['id', 'type_name', 'category']
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTypes);
        });

        it('should handle errors and return status 500', async () => {
            const error = new Error('Database error');
            ClothingType.findAll.mockRejectedValue(error);

            await Types.getAllTypes(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: error.message });
        });
    });
});