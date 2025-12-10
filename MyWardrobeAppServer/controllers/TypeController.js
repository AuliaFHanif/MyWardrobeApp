const {ClothingType} = require("../models");

class Types{
    static async getAllTypes(req, res, next) {
        try {
            const types = await ClothingType.findAll({
                attributes: ['id', 'type_name', 'category']
            });
            res.status(200).json(types);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = Types;