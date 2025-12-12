module.exports = {
    User: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn()
    },
    ClothingItem: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        findAndCountAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn()
    },
    Brand: {
        findAll: jest.fn()
    },
    Color: {
        findAll: jest.fn()
    },
    ClothingType: {
        findAll: jest.fn()
    },
    Occasion: {
        findAll: jest.fn()
    }
};