const {
  ClothingItem,
  ClothingType,
  Brand,
  Color,
  User,
  Occasion,
} = require("../models");
const { v2: cloudinary } = require("cloudinary");
const { verifyToken } = require("../helpers/jwt");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class Clothing {
  static async getClothingItemPublic(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const clothingItems = await ClothingItem.findAll({limit, offset,
        attributes: { exclude: ["user_id", "brand_id", "type_id", "color_id"] },
        include: [
          {
            model: ClothingType,
            as: "type",
            attributes: ["type_name", "category"],
          },
          {
            model: Brand,
            as: "brand",
            attributes: ["brand_name"],
          },
          {
            model: Color,
            as: "color",
            attributes: ["color_name", "hex_code"],
          },
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name"],
          },
          {
            model: Occasion,
            as: "occasions",
            attributes: ["occasion_name"],
            through: { attributes: [] },
          },
        ],
      });
      res.status(200).json(clothingItems);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getClothingItemDetailPublic(req, res, next) {
    try {
    } catch (error) {}
  }

  static async addClothingItem(req, res, next) {
    try {
    } catch (error) {}
  }

  static async editClothingItem(req, res, next) {
    try {
    } catch (error) {}
  }

  static async deleteClothingItem(req, res, next) {
    try {
    } catch (error) {}
  }

  static async editClothingItemImage(req, res, next) {}
}

module.exports = Clothing;
