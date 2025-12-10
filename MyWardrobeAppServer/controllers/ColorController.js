const { Color } = require('../models');

class ColorController {
    static async getAllColors(req, res, next) {
        try {
            const colors = await Color.findAll({
                attributes: ['id', 'color_name', 'hex_code']
            });
            res.status(200).json(colors);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ColorController;
