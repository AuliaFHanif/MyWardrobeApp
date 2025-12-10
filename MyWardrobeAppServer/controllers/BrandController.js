const { Brand } = require('../models');

class BrandController{
    static async getAllBrands(req, res, next) {
        try {
            const brands = await Brand.findAll({
                attributes: ['id', 'brand_name']
            });
            res.status(200).json(brands);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = BrandController;
