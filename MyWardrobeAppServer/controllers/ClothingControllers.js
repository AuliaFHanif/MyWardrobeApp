const {ClothingItem,ClothingType,Brand,Color,User,Occasion,} = require("../models");
// No name search required; keep imports minimal
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
      const category = req.query.category || "";
      const brand_id = req.query.brand_id || "";
      const color_id = req.query.color_id || "";
      const sortBy = req.query.sort || "createdAt";
      const sortOrder = req.query.order || "DESC";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      let whereQuery = {};

      const clothingItems = await ClothingItem.findAll({
        limit,
        offset,
        where: whereQuery,
        order: [[sortBy, sortOrder]],
        attributes: { exclude: ["user_id", "brand_id", "type_id", "color_id"] },
        include: [
          {
            model: ClothingType,
            as: "type",
            attributes: ["type_name", "category"],
            where: category ? { category: category } : undefined,
            required: !!category,
          },
          {
            model: Brand,
            as: "brand",
            attributes: ["brand_name"],
            where: brand_id ? { id: brand_id } : undefined,
            required: !!brand_id,
          },
          {
            model: Color,
            as: "color",
            attributes: ["color_name", "hex_code"],
            where: color_id ? { id: color_id } : undefined,
            required: !!color_id,
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

  static async getClothingItemPersonal(req, res, next) {
    try {
      const bearerToken = req.headers.authorization;
      const accessToken = bearerToken.split(" ")[1];
      const data = verifyToken(accessToken);
      const category = req.query.category || "";
      const brand_id = req.query.brand_id || "";
      const color_id = req.query.color_id || "";
      const sortBy = req.query.sort || "createdAt";
      const sortOrder = req.query.order || "DESC";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      

      const clothingItems = await ClothingItem.findAll({
        limit,
        offset,
        where: { user_id: data.id },
        order: [[sortBy, sortOrder]],
        attributes: { exclude: ["user_id", "brand_id", "type_id", "color_id"] },
        include: [
          {
            model: ClothingType,
            as: "type",
            attributes: ["type_name", "category"],
            where: category ? { category: category } : undefined,
            required: !!category,
          },
          {
            model: Brand,
            as: "brand",
            attributes: ["brand_name"],
            where: brand_id ? { id: brand_id } : undefined,
            required: !!brand_id,
          },
          {
            model: Color,
            as: "color",
            attributes: ["color_name", "hex_code"],
            where: color_id ? { id: color_id } : undefined,
            required: !!color_id,
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

  static async getClothingItemDetail(req, res, next) {
    try {
      const id = req.params.id;
      const itemDetails = await ClothingItem.findByPk(id, {
       attributes: { exclude: ["user_id", "brand_id", "type_id", "color_id"] },
        include: [
          {
            model: ClothingType,
            as: "type",
            attributes: ["type_name", "category"],
            where: category ? { category: category } : undefined,
            required: !!category,
          },
          {
            model: Brand,
            as: "brand",
            attributes: ["brand_name"],
            where: brand_id ? { id: brand_id } : undefined,
            required: !!brand_id,
          },
          {
            model: Color,
            as: "color",
            attributes: ["color_name", "hex_code"],
            where: color_id ? { id: color_id } : undefined,
            required: !!color_id,
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
      res.status(200).json(itemDetails);
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
