const Clothing = require('.../controllers/ClothingControllers');
const { ClothingItem, ClothingType, Brand, Color, User, Occasion } = require('.../models');
const { verifyToken } = require('.../helpers/jwt');
const { v2: cloudinary } = require('cloudinary');
const { GoogleGenAI } = require('@google/genai');

jest.mock('../models');
jest.mock('../helpers/jwt');
jest.mock('cloudinary');
jest.mock('@google/genai');

global.fetch = jest.fn();

describe('ClothingControllers', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            body: {},
            params: {},
            headers: {},
            user: {},
            file: {}
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

    describe('fetchWeatherData', () => {
        it('should fetch weather data successfully', async () => {
            const mockWeatherData = {
                name: 'Jakarta',
                main: { temp: 30, feels_like: 32 },
                weather: [{ main: 'Clear', description: 'clear sky' }]
            };

            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockWeatherData)
            });

            const result = await Clothing.fetchWeatherData(-6.2, 106.8);

            expect(result).toEqual({
                location: 'Jakarta',
                temperature: 30,
                feelsLike: 32,
                condition: 'Clear',
                description: 'clear sky'
            });
        });

        it('should return null on error', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));

            const result = await Clothing.fetchWeatherData(-6.2, 106.8);

            expect(result).toBeNull();
        });
    });

    describe('getClothingItemPublic', () => {
        it('should return public clothing items', async () => {
            const mockItems = [
                { id: 1, size: 'M', material: 'Cotton' }
            ];

            ClothingItem.findAll.mockResolvedValue(mockItems);

            await Clothing.getClothingItemPublic(req, res, next);

            expect(ClothingItem.findAll).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockItems);
        });

        it('should filter by category', async () => {
            req.query.category = 'Tops';
            const mockItems = [];

            ClothingItem.findAll.mockResolvedValue(mockItems);

            await Clothing.getClothingItemPublic(req, res, next);

            expect(ClothingItem.findAll).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should filter by brand_id and color_id', async () => {
            req.query.brand_id = '1';
            req.query.color_id = '2';
            const mockItems = [];

            ClothingItem.findAll.mockResolvedValue(mockItems);

            await Clothing.getClothingItemPublic(req, res, next);

            expect(ClothingItem.findAll).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            ClothingItem.findAll.mockRejectedValue(error);

            await Clothing.getClothingItemPublic(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: error.message });
        });
    });

    describe('getClothingItemPersonal', () => {
        it('should return personal clothing items with pagination', async () => {
            const mockItems = [
                { id: 1, size: 'M', material: 'Cotton' }
            ];

            req.headers.authorization = 'Bearer mock-token';
            req.query.page = '1';
            req.query.limit = '12';

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAndCountAll.mockResolvedValue({
                count: 10,
                rows: mockItems
            });

            await Clothing.getClothingItemPersonal(req, res, next);

            expect(verifyToken).toHaveBeenCalledWith('mock-token');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                items: mockItems,
                totalItems: 10,
                currentPage: 1,
                limit: 12
            });
        });

        it('should filter by category, brand, and color', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.query.category = 'Tops';
            req.query.brand_id = '1';
            req.query.color_id = '2';

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAndCountAll.mockResolvedValue({
                count: 5,
                rows: []
            });

            await Clothing.getClothingItemPersonal(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should handle errors', async () => {
            const error = new Error('Auth error');
            req.headers.authorization = 'Bearer mock-token';

            verifyToken.mockImplementation(() => {
                throw error;
            });

            await Clothing.getClothingItemPersonal(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getClothingItemDetail', () => {
        it('should return clothing item detail', async () => {
            const mockItem = {
                id: 1,
                size: 'M',
                material: 'Cotton'
            };

            req.params.id = '1';
            ClothingItem.findByPk.mockResolvedValue(mockItem);

            await Clothing.getClothingItemDetail(req, res, next);

            expect(ClothingItem.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockItem);
        });

        it('should handle errors', async () => {
            const error = new Error('Not found');
            req.params.id = '999';

            ClothingItem.findByPk.mockRejectedValue(error);

            await Clothing.getClothingItemDetail(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('addClothingItem', () => {
        it('should add clothing item successfully', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = {
                type_id: 1,
                brand_id: 1,
                color_id: 1,
                size: 'M',
                material: 'Cotton',
                last_used: new Date(),
                image_url: 'http://example.com/image.jpg'
            };

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.create.mockResolvedValue({});

            await Clothing.addClothingItem(req, res, next);

            expect(ClothingItem.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Clothing item added successfully' });
        });

        it('should handle errors', async () => {
            const error = new Error('Validation error');
            req.headers.authorization = 'Bearer mock-token';
            req.body = {};

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.create.mockRejectedValue(error);

            await Clothing.addClothingItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('editClothingItem', () => {
        it('should edit clothing item successfully', async () => {
            req.params.id = '1';
            req.headers.authorization = 'Bearer mock-token';
            req.body = {
                type_id: 1,
                brand_id: 1,
                color_id: 1,
                size: 'L',
                material: 'Polyester',
                last_used: new Date(),
                image_url: 'http://example.com/image.jpg',
                notes: 'Updated'
            };

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.update.mockResolvedValue([1]);

            await Clothing.editClothingItem(req, res, next);

            expect(ClothingItem.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Clothing item updated successfully' });
        });

        it('should return 404 if item not found or unauthorized', async () => {
            req.params.id = '999';
            req.headers.authorization = 'Bearer mock-token';
            req.body = { size: 'L' };

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.update.mockResolvedValue([0]);

            await Clothing.editClothingItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Item not found/you are not authorized to edit it'
            });
        });

        it('should handle errors', async () => {
            const error = new Error('Update error');
            req.params.id = '1';
            req.headers.authorization = 'Bearer mock-token';
            req.body = {};

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.update.mockRejectedValue(error);

            await Clothing.editClothingItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('deleteClothingItem', () => {
        it('should delete clothing item successfully as Admin', async () => {
            const mockItem = {
                id: 1,
                authorId: 2,
                destroy: jest.fn().mockResolvedValue()
            };

            req.params.id = '1';
            req.user = { id: 1, role: 'Admin' };

            ClothingItem.findByPk.mockResolvedValue(mockItem);

            await Clothing.deleteClothingItem(req, res, next);

            expect(mockItem.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Item deleted successfully' });
        });

        it('should delete own item as familyMember', async () => {
            const mockItem = {
                id: 1,
                authorId: 1,
                destroy: jest.fn().mockResolvedValue()
            };

            req.params.id = '1';
            req.user = { id: 1, role: 'familyMember' };

            ClothingItem.findByPk.mockResolvedValue(mockItem);

            await Clothing.deleteClothingItem(req, res, next);

            expect(mockItem.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if item not found', async () => {
            req.params.id = '999';
            req.user = { id: 1, role: 'Admin' };

            ClothingItem.findByPk.mockResolvedValue(null);

            await Clothing.deleteClothingItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Clothing item not found' });
        });

        it('should handle unauthorized deletion', async () => {
            const mockItem = {
                id: 1,
                authorId: 2
            };

            req.params.id = '1';
            req.user = { id: 1, role: 'familyMember' };

            ClothingItem.findByPk.mockResolvedValue(mockItem);

            await Clothing.deleteClothingItem(req, res, next);

            expect(next).toHaveBeenCalledWith({
                name: 'Unauthorized',
                message: 'You are not authorized to delete this clothing item'
            });
        });

        it('should handle errors', async () => {
            const error = new Error('Delete error');
            req.params.id = '1';
            req.user = { id: 1, role: 'Admin' };

            ClothingItem.findByPk.mockRejectedValue(error);

            await Clothing.deleteClothingItem(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('editClothingItemImage', () => {
        it('should update image successfully', async () => {
            const mockItem = {
                id: 1,
                image_url: 'old-url',
                save: jest.fn().mockResolvedValue()
            };

            req.params.id = '1';
            req.file = { path: '/tmp/image.jpg' };

            ClothingItem.findByPk.mockResolvedValue(mockItem);
            cloudinary.uploader.upload.mockResolvedValue({
                secure_url: 'https://cloudinary.com/new-image.jpg'
            });

            await Clothing.editClothingItemImage(req, res, next);

            expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/tmp/image.jpg', {
                folder: 'MyWardrobeApp'
            });
            expect(mockItem.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image updated successfully',
                imageUrl: 'https://cloudinary.com/new-image.jpg'
            });
        });

        it('should return 404 if item not found', async () => {
            req.params.id = '999';
            req.file = { path: '/tmp/image.jpg' };

            ClothingItem.findByPk.mockResolvedValue(null);

            await Clothing.editClothingItemImage(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Clothing item not found' });
        });

        it('should handle errors', async () => {
            const error = new Error('Upload error');
            req.params.id = '1';
            req.file = { path: '/tmp/image.jpg' };

            ClothingItem.findByPk.mockRejectedValue(error);

            await Clothing.editClothingItemImage(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateLastUsed', () => {
        it('should update last used dates successfully', async () => {
            req.body = { itemIds: [1, 2, 3] };

            ClothingItem.update.mockResolvedValue([3]);

            await Clothing.updateLastUsed(req, res, next);

            expect(ClothingItem.update).toHaveBeenCalledWith(
                { last_used: expect.any(Date) },
                { where: { id: [1, 2, 3] } }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Last used dates updated successfully',
                updatedCount: 3
            });
        });

        it('should return 400 if itemIds is not an array', async () => {
            req.body = { itemIds: 'not-an-array' };

            await Clothing.updateLastUsed(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'itemIds array is required.' });
        });

        it('should return 400 if itemIds is empty', async () => {
            req.body = { itemIds: [] };

            await Clothing.updateLastUsed(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if no items found', async () => {
            req.body = { itemIds: [999] };

            ClothingItem.update.mockResolvedValue([0]);

            await Clothing.updateLastUsed(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No items found or updated.' });
        });

        it('should handle errors', async () => {
            const error = new Error('Update error');
            req.body = { itemIds: [1] };

            ClothingItem.update.mockRejectedValue(error);

            await Clothing.updateLastUsed(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getOutfitSuggestionsDummy', () => {
        it('should return dummy outfit suggestions', async () => {
            await Clothing.getOutfitSuggestionsDummy(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                criteria: expect.any(Object),
                suggestions: expect.any(Array)
            }));
        });

        it('should handle errors', async () => {
            const error = new Error('Error');
            res.status.mockImplementation(() => {
                throw error;
            });

            await Clothing.getOutfitSuggestionsDummy(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getOutfitSuggestions', () => {
        beforeEach(() => {
            process.env.GEMINI_API_KEY = 'test-api-key';
        });

        it('should return 400 if occasion is missing', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = {};

            verifyToken.mockReturnValue({ id: 1 });

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Occasion is required' });
        });

        it('should return 404 if user has no clothing items', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Party' };

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue([]);

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No clothing items found for this user'
            });
        });

        it('should fetch weather data when coordinates provided', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = {
                occasion: 'Party',
                lat: '-6.2',
                lon: '106.8'
            };

            const mockWeatherData = {
                name: 'Jakarta',
                main: { temp: 30, feels_like: 32 },
                weather: [{ main: 'Clear', description: 'clear sky' }]
            };

            const mockItems = [{
                id: 1,
                size: 'M',
                material: 'Cotton',
                type: { type_name: 'T-Shirt', category: 'Tops' },
                brand: { brand_name: 'Nike' },
                color: { color_name: 'Blue' },
                occasions: []
            }];

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);
            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockWeatherData)
            });

            const mockAI = {
                models: {
                    generateContent: jest.fn().mockResolvedValue({
                        text: JSON.stringify([{
                            outfit_name: 'Casual',
                            items: [1],
                            description: 'Test outfit',
                            style_tips: 'Tips'
                        }])
                    })
                }
            };

            GoogleGenAI.mockImplementation(() => mockAI);

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                suggestions: expect.any(Array)
            }));
        });

        it('should handle invalid API key error', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Party' };

            const mockItems = [{
                id: 1,
                size: 'M',
                material: 'Cotton',
                type: { type_name: 'T-Shirt', category: 'Tops' },
                brand: { brand_name: 'Nike' },
                color: { color_name: 'Blue' },
                occasions: []
            }];

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);

            const mockAI = {
                models: {
                    generateContent: jest.fn().mockRejectedValue(
                        new Error('API_KEY_INVALID: The provided key is invalid')
                    )
                }
            };

            GoogleGenAI.mockImplementation(() => mockAI);

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'API_KEY_INVALID',
                message: 'The provided Gemini API key is invalid or not authorized for this request'
            });
        });

        it('should return 500 if GEMINI_API_KEY not configured', async () => {
            delete process.env.GEMINI_API_KEY;

            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Party' };

            const mockItems = [{
                id: 1,
                type: { category: 'Tops' },
                brand: {},
                color: {},
                occasions: []
            }];

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'GEMINI_API_KEY is not configured on the server'
            });
        });

        it('should handle JSON parse errors', async () => {
            process.env.GEMINI_API_KEY = 'test-key';
            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Party' };

            const mockItems = [{
                id: 1,
                type: { category: 'Tops', type_name: 'Shirt' },
                brand: { brand_name: 'Nike' },
                color: { color_name: 'Blue' },
                occasions: []
            }];

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);

            const mockAI = {
                models: {
                    generateContent: jest.fn().mockResolvedValue({
                        text: 'invalid json'
                    })
                }
            };

            GoogleGenAI.mockImplementation(() => mockAI);

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to parse AI suggestions',
                rawResponse: 'invalid json'
            });
        });
    });
});