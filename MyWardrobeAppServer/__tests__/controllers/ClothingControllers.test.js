const Clothing = require('../../controllers/ClothingControllers');

jest.mock('../../models', () => ({
    ClothingItem: {
        findAll: jest.fn(),
        findAndCountAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn()
    },
    ClothingType: {},
    Brand: {},
    Color: {},
    User: {},
    Occasion: {}
}));

jest.mock('../../helpers/jwt', () => ({
    verifyToken: jest.fn()
}));

jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn()
        }
    }
}));

jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn()
}));

const { ClothingItem } = require('../../models');
const { verifyToken } = require('../../helpers/jwt');
const { v2: cloudinary } = require('cloudinary');
const { GoogleGenAI } = require('@google/genai');

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

        it('should handle pagination parameters', async () => {
            req.query.page = '2';
            req.query.limit = '10';
            req.query.sort = 'createdAt';
            req.query.order = 'ASC';
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
            res.status.mockImplementationOnce(() => {
                throw error;
            });

            await Clothing.getOutfitSuggestionsDummy(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getOutfitSuggestions', () => {
        let mockAI;

        beforeEach(() => {
            mockAI = {
                models: {
                    generateContent: jest.fn()
                }
            };
            GoogleGenAI.mockImplementation(() => mockAI);
            process.env.GEMINI_API_KEY = 'test-api-key';
            process.env.OPENWEATHER_API_KEY = 'test-weather-key';
        });

        afterEach(() => {
            delete process.env.GEMINI_API_KEY;
            delete process.env.OPENWEATHER_API_KEY;
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
            req.body = { occasion: 'Date Night' };

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue([]);

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No clothing items found for this user'
            });
        });

        it('should return 500 if GEMINI_API_KEY is not set', async () => {
            delete process.env.GEMINI_API_KEY;

            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Date Night' };

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue([
                {
                    id: 1,
                    size: 'M',
                    material: 'Cotton',
                    notes: 'Test',
                    image_url: 'http://example.com/1.jpg',
                    type: { type_name: 'T-Shirt', category: 'Tops' },
                    brand: { brand_name: 'Nike' },
                    color: { color_name: 'Blue' },
                    occasions: [{ occasion_name: 'Casual' }]
                }
            ]);

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'GEMINI_API_KEY is not configured on the server'
            });
        });

        it('should generate outfit suggestions successfully without weather', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = {
                occasion: 'Date Night',
                stylePreference: 'Romantic'
            };

            const mockItems = [
                {
                    id: 1,
                    size: 'M',
                    material: 'Cotton',
                    notes: 'Blue shirt',
                    image_url: 'http://example.com/1.jpg',
                    type: { type_name: 'Shirt', category: 'Tops' },
                    brand: { brand_name: 'Nike' },
                    color: { color_name: 'Blue' },
                    occasions: [{ occasion_name: 'Casual' }]
                },
                {
                    id: 2,
                    size: '32',
                    material: 'Denim',
                    notes: 'Black jeans',
                    image_url: 'http://example.com/2.jpg',
                    type: { type_name: 'Jeans', category: 'Bottoms' },
                    brand: { brand_name: 'Levis' },
                    color: { color_name: 'Black' },
                    occasions: [{ occasion_name: 'Casual' }]
                }
            ];

            const mockAIResponse = JSON.stringify([
                {
                    outfit_name: 'Casual Chic',
                    items: [1, 2],
                    description: 'Perfect for a date night',
                    style_tips: 'Add accessories'
                }
            ]);

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);
            mockAI.models.generateContent.mockResolvedValue({
                text: mockAIResponse
            });

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                criteria: expect.objectContaining({
                    occasion: 'Date Night',
                    stylePreference: 'Romantic'
                }),
                suggestions: expect.any(Array),
                wardrobeSize: 2
            }));
        });

        it('should fetch weather data when lat and lon are provided', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = {
                occasion: 'Work',
                lat: -6.2,
                lon: 106.8
            };

            const mockWeatherData = {
                name: 'Jakarta',
                main: { temp: 30, feels_like: 32 },
                weather: [{ main: 'Clear', description: 'clear sky' }]
            };

            const mockItems = [
                {
                    id: 1,
                    size: 'M',
                    material: 'Cotton',
                    notes: 'Work shirt',
                    image_url: 'http://example.com/1.jpg',
                    type: { type_name: 'Shirt', category: 'Tops' },
                    brand: { brand_name: 'Nike' },
                    color: { color_name: 'White' },
                    occasions: [{ occasion_name: 'Work' }]
                }
            ];

            const mockAIResponse = JSON.stringify([
                {
                    outfit_name: 'Business Casual',
                    items: [1],
                    description: 'Great for work',
                    style_tips: 'Iron the shirt'
                }
            ]);

            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockWeatherData)
            });

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);
            mockAI.models.generateContent.mockResolvedValue({
                text: mockAIResponse
            });

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(global.fetch).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                criteria: expect.objectContaining({
                    weather: expect.stringContaining('clear sky')
                })
            }));
        });

        it('should use explicit weather input if provided', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = {
                occasion: 'Outdoor',
                weather: 'Rainy and cold'
            };

            const mockItems = [
                {
                    id: 1,
                    size: 'L',
                    material: 'Waterproof',
                    notes: 'Rain jacket',
                    image_url: 'http://example.com/1.jpg',
                    type: { type_name: 'Jacket', category: 'Outerwear' },
                    brand: { brand_name: 'North Face' },
                    color: { color_name: 'Black' },
                    occasions: [{ occasion_name: 'Outdoor' }]
                }
            ];

            const mockAIResponse = JSON.stringify([
                {
                    outfit_name: 'Rainy Day',
                    items: [1],
                    description: 'Stay dry',
                    style_tips: 'Bring umbrella'
                }
            ]);

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);
            mockAI.models.generateContent.mockResolvedValue({
                text: mockAIResponse
            });

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                criteria: expect.objectContaining({
                    weather: 'Rainy and cold'
                })
            }));
        });

        it('should handle AI response with markdown code blocks', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Party' };

            const mockItems = [
                {
                    id: 1,
                    size: 'M',
                    material: 'Silk',
                    notes: 'Party dress',
                    image_url: 'http://example.com/1.jpg',
                    type: { type_name: 'Dress', category: 'Tops' },
                    brand: { brand_name: 'Zara' },
                    color: { color_name: 'Red' },
                    occasions: [{ occasion_name: 'Party' }]
                }
            ];

            const mockAIResponse = '```json\n[{"outfit_name":"Party Look","items":[1],"description":"Stunning","style_tips":"Add heels"}]\n```';

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);
            mockAI.models.generateContent.mockResolvedValue({
                text: mockAIResponse
            });

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                suggestions: expect.arrayContaining([
                    expect.objectContaining({
                        outfit_name: 'Party Look'
                    })
                ])
            }));
        });

        it('should return 500 if AI response cannot be parsed', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Meeting' };

            const mockItems = [
                {
                    id: 1,
                    size: 'M',
                    material: 'Cotton',
                    notes: 'Shirt',
                    image_url: 'http://example.com/1.jpg',
                    type: { type_name: 'Shirt', category: 'Tops' },
                    brand: { brand_name: 'Nike' },
                    color: { color_name: 'Blue' },
                    occasions: [{ occasion_name: 'Work' }]
                }
            ];

            const invalidAIResponse = 'This is not valid JSON';

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);
            mockAI.models.generateContent.mockResolvedValue({
                text: invalidAIResponse
            });

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'Failed to parse AI suggestions',
                rawResponse: invalidAIResponse
            }));
        });

        it('should handle API_KEY_INVALID error', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Event' };

            const mockItems = [
                {
                    id: 1,
                    size: 'M',
                    material: 'Cotton',
                    notes: 'Shirt',
                    image_url: 'http://example.com/1.jpg',
                    type: { type_name: 'Shirt', category: 'Tops' },
                    brand: { brand_name: 'Nike' },
                    color: { color_name: 'Blue' },
                    occasions: [{ occasion_name: 'Casual' }]
                }
            ];

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);
            mockAI.models.generateContent.mockRejectedValue(
                new Error('API_KEY_INVALID: The API key is invalid')
            );

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'API_KEY_INVALID'
            }));
        });

        it('should handle general errors', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Concert' };

            const mockItems = [
                {
                    id: 1,
                    size: 'M',
                    material: 'Cotton',
                    notes: 'T-shirt',
                    image_url: 'http://example.com/1.jpg',
                    type: { type_name: 'T-Shirt', category: 'Tops' },
                    brand: { brand_name: 'Nike' },
                    color: { color_name: 'Black' },
                    occasions: [{ occasion_name: 'Casual' }]
                }
            ];

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);
            mockAI.models.generateContent.mockRejectedValue(
                new Error('Network error')
            );

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'Failed to generate outfit suggestions'
            }));
        });

        it('should filter out null items when enhancing suggestions', async () => {
            req.headers.authorization = 'Bearer mock-token';
            req.body = { occasion: 'Gym' };

            const mockItems = [
                {
                    id: 1,
                    size: 'M',
                    material: 'Polyester',
                    notes: 'Gym shirt',
                    image_url: 'http://example.com/1.jpg',
                    type: { type_name: 'T-Shirt', category: 'Tops' },
                    brand: { brand_name: 'Adidas' },
                    color: { color_name: 'Gray' },
                    occasions: [{ occasion_name: 'Sport' }]
                }
            ];

            // AI suggests items that don't exist (item ID 999)
            const mockAIResponse = JSON.stringify([
                {
                    outfit_name: 'Gym Outfit',
                    items: [1, 999],
                    description: 'Perfect for workout',
                    style_tips: 'Stay hydrated'
                }
            ]);

            verifyToken.mockReturnValue({ id: 1 });
            ClothingItem.findAll.mockResolvedValue(mockItems);
            mockAI.models.generateContent.mockResolvedValue({
                text: mockAIResponse
            });

            await Clothing.getOutfitSuggestions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            const response = res.json.mock.calls[0][0];
            // Should only have item 1, item 999 should be filtered out
            expect(response.suggestions[0].itemDetails).toHaveLength(1);
            expect(response.suggestions[0].itemDetails[0].id).toBe(1);
        });
    });
});