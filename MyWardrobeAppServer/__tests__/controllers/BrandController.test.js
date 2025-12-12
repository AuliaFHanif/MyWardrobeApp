const BrandController = require('.../controllers/BrandController');
const { Brand } = require('.../models');

jest.mock('../models');

describe('BrandController', () => {
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

    describe('getAllBrands', () => {
        it('should return all brands with status 200', async () => {
            const mockBrands = [
                { id: 1, brand_name: 'Nike' },
                { id: 2, brand_name: 'Adidas' }
            ];

            Brand.findAll.mockResolvedValue(mockBrands);

            await BrandController.getAllBrands(req, res, next);

            expect(Brand.findAll).toHaveBeenCalledWith({
                attributes: ['id', 'brand_name']
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockBrands);
        });

        it('should handle errors and return status 500', async () => {
            const error = new Error('Database error');
            Brand.findAll.mockRejectedValue(error);

            await BrandController.getAllBrands(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: error.message });
        });
    });
});