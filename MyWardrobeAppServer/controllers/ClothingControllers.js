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
const { GoogleGenAI } = require("@google/genai");


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
      res.status(200).json(itemDetails);
    } catch (error) { }
  }

  static async addClothingItem(req, res, next) {
    try {
      const {
        type_id,
        brand_id,
        color_id,
        size,
        material,
        last_used,
        image_url,
      } = req.body;
      const bearerToken = req.headers.authorization;
      const accessToken = bearerToken.split(" ")[1];
      const data = verifyToken(accessToken);
      await ClothingItem.create({
        user_id: data.id,
        type_id,
        brand_id,
        color_id,
        size,
        material,
        last_used,
        image_url,
      });
      res.status(201).json({ message: "Clothing item added successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async editClothingItem(req, res, next) {
    try {
      const itemId = req.params.id;
      const {
        type_id,
        brand_id,
        color_id,
        size,
        material,
        last_used,
        image_url,
      } = req.body;
      const bearerToken = req.headers.authorization;
      const accessToken = bearerToken.split(" ")[1];
      const data = verifyToken(accessToken);
      await ClothingItem.update({ where: { id: itemId } }, {
        user_id: data.id,
        type_id,
        brand_id,
        color_id,
        size,
        material,
        last_used,
        image_url,
      });
      res.status(201).json({ message: "Clothing item added successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteClothingItem(req, res, next) {
    try {
      const clothingItemId = +req.params.id;
      const clothingItem = await ClothingItem.findByPk(clothingItemId);
      if (req.user.role !== "Admin" && clothingItem.authorId !== req.user.id) {
        throw { name: "Unauthorized", message: "You are not authorized to delete this clothing item" };
      }
      if (!clothingItem) {
        res.status(404).json({ message: `Clothing item not found` });
        return;
      }

      await clothingItem.destroy();
      res.status(200).json({ message: `Item deleted successfully` });
    } catch (error) {

      next(error)

    }
  }

  static async editClothingItemImage(req, res, next) {
    try {
      const clothingItemId = +req.params.id;
      const clothingItem = await ClothingItem.findByPk(clothingItemId);
      if (!clothingItem) {
        res.status(404).json({ message: `Clothing item not found` });
        return;
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "MyWardrobeApp",
      });
      clothingItem.image_url = result.secure_url;
      await clothingItem.save();
      res.status(200).json({ message: "Image updated successfully", imageUrl: result.secure_url });
    } catch (error) {
      next(error);
    }
  }

  static async getOutfitSuggestions(req, res, next) {
    try {
      const { occasion, weather, stylePreference, userId } = req.body;

      // Validate input
      if (!occasion || !userId) {
        return res.status(400).json({ 
          error: 'Occasion and userId are required' 
        });
      }

      // Get user's wardrobe with related data
      const userOutfits = await ClothingItem.findAll({
        where: { user_id: userId },
        attributes: ["id", "size", "material", "notes"],
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
            attributes: ["color_name"],
          },
          {
            model: Occasion,
            as: "occasions",
            attributes: ["occasion_name"],
            through: { attributes: [] },
          },
        ],
      });

      // Check if user has any clothes
      if (userOutfits.length === 0) {
        return res.status(404).json({ 
          error: 'No clothing items found for this user' 
        });
      }

      // Simplify data for AI processing
      const simplifiedOutfits = userOutfits.map(item => ({
        id: item.id,
        item: `${item.color.color_name} ${item.type.type_name}`,
        brand: item.brand.brand_name,
        category: item.type.category,
        occasions: item.occasions.map(o => o.occasion_name),
        size: item.size,
        material: item.material
      }));

      // Group items by category for better context
      const groupedItems = simplifiedOutfits.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      // Initialize Gemini AI
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
      });

      // Create prompt for Gemini
      const prompt = `
You are a professional fashion stylist. Create 3 complete outfit suggestions based on the following wardrobe and criteria.

WARDROBE ITEMS:
${JSON.stringify(groupedItems, null, 2)}

CRITERIA:
- Occasion: ${occasion}
${weather ? `- Weather: ${weather}` : ''}
${stylePreference ? `- Style Preference: ${stylePreference}` : ''}

INSTRUCTIONS:
1. Create 3 different complete outfits
2. Each outfit should include items from different categories (Tops, Bottoms, Footwear, etc.)
3. Consider color coordination and style compatibility
4. Only use item IDs from the provided wardrobe
5. Ensure each outfit is appropriate for the "${occasion}" occasion

Return ONLY a valid JSON array with this exact format (no markdown, no extra text):
[
  {
    "outfit_name": "Outfit name here",
    "items": [1, 5, 12],
    "description": "Why this outfit works for ${occasion}",
    "style_tips": "Additional styling advice"
  }
]
`;

      // Call Gemini API using the models.generateContent pattern
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let aiResponse = response.text;

      // Clean up response (remove markdown code blocks if present)
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Parse AI response
      let suggestions;
      try {
        suggestions = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse);
        return res.status(500).json({ 
          error: 'Failed to parse AI suggestions',
          rawResponse: aiResponse 
        });
      }

      // Enhance suggestions with full item details
      const enhancedSuggestions = suggestions.map(outfit => {
        const itemDetails = outfit.items.map(itemId => {
          const fullItem = userOutfits.find(item => item.id === itemId);
          return fullItem ? {
            id: fullItem.id,
            name: `${fullItem.color.color_name} ${fullItem.type.type_name}`,
            brand: fullItem.brand.brand_name,
            category: fullItem.type.category,
            color: fullItem.color.color_name,
            size: fullItem.size,
            image_url: fullItem.image_url,
            notes: fullItem.notes
          } : null;
        }).filter(item => item !== null);

        return {
          ...outfit,
          itemDetails
        };
      });

      res.status(200).json({
        success: true,
        criteria: {
          occasion,
          weather: weather || 'Not specified',
          stylePreference: stylePreference || 'Not specified'
        },
        suggestions: enhancedSuggestions,
        wardrobeSize: userOutfits.length
      });

    } catch (error) {
      console.error('Outfit suggestion error:', error);
      res.status(500).json({ 
        error: 'Failed to generate outfit suggestions',
        message: error.message 
      });
    }
  }

  static async getOutfitSuggestionsDummy(req, res, next) {
    try {
      
      res.status(200).json({
    "success": true,
    "criteria": {
        "occasion": "Party",
        "weather": "Warm evening",
        "stylePreference": "Elegant and sophisticated"
    },
    "suggestions": [
        {
            "outfit_name": "Casual Chic Skirt Look",
            "items": [
                11,
                46,
                13
            ],
            "description": "This outfit leverages the Light Blue Skirt to offer a slightly more feminine and relaxed 'party' feel suitable for a warm evening. The solid Red T-Shirt adds a vibrant pop of color, making it appropriate for an informal gathering.",
            "style_tips": "While not achieving true elegance with the current wardrobe, tucking the Red T-Shirt neatly into the skirt can create a more polished silhouette. The White Sneakers maintain comfort and a casual-chic appeal, ideal for a relaxed atmosphere.",
            "itemDetails": [
                {
                    "id": 11,
                    "name": "Red T-Shirt",
                    "brand": "Nike",
                    "category": "Tops",
                    "color": "Red",
                    "size": "M",
                    "notes": "Red casual t-shirt"
                },
                {
                    "id": 46,
                    "name": "Light Blue Skirt",
                    "brand": "Consina",
                    "category": "Bottoms",
                    "color": "Light Blue",
                    "size": "30",
                    "notes": "Black shorts"
                },
                {
                    "id": 13,
                    "name": "White Sneakers",
                    "brand": "Specs",
                    "category": "Footwear",
                    "color": "White",
                    "size": "42",
                    "notes": "Soccer cleats"
                }
            ]
        },
        {
            "outfit_name": "Smart Casual Chinos Ensemble",
            "items": [
                25,
                48,
                27
            ],
            "description": "Designed for a relaxed evening party, this outfit utilizes the Navy Blue Chinos to provide a smart-casual base. Paired with a Red T-Shirt, it offers a comfortable yet put-together look for warmer temperatures and informal social events.",
            "style_tips": "To elevate this simple combination, ensure the Red T-Shirt is well-fitted and consider a neat half-tuck or full tuck. This ensemble prioritizes comfort and a clean appearance, best suited for very informal gatherings rather than a formal party setting.",
            "itemDetails": [
                {
                    "id": 25,
                    "name": "Red T-Shirt",
                    "brand": "Nike",
                    "category": "Tops",
                    "color": "Red",
                    "size": "M",
                    "notes": "Red casual t-shirt"
                },
                {
                    "id": 48,
                    "name": "Navy Blue Chinos",
                    "brand": "Levi's",
                    "category": "Bottoms",
                    "color": "Navy Blue",
                    "size": "L",
                    "notes": "Gray hoodie"
                },
                {
                    "id": 27,
                    "name": "White Sneakers",
                    "brand": "Specs",
                    "category": "Footwear",
                    "color": "White",
                    "size": "42",
                    "notes": "Soccer cleats"
                }
            ]
        },
        {
            "outfit_name": "Monochromatic Sporty-Casual",
            "items": [
                33,
                12,
                13
            ],
            "description": "This outfit presents a sleek, monochromatic black base for a very casual evening gathering. The Black Activewear Top and Black Shorts create a streamlined, modern aesthetic that is comfortable for warm weather, leaning into a sporty-chic vibe.",
            "style_tips": "Given the activewear nature, focus on clean lines and a well-fitted silhouette to make it appear more intentional. This look is inherently casual and best suited for an extremely informal party or outdoor activity where comfort is key, rather than an elegant event.",
            "itemDetails": [
                {
                    "id": 33,
                    "name": "Black Activewear Top",
                    "brand": "League",
                    "category": "Activewear",
                    "color": "Black",
                    "size": "M",
                    "notes": "Athletic workout top"
                },
                {
                    "id": 12,
                    "name": "Black Shorts",
                    "brand": "3Second",
                    "category": "Bottoms",
                    "color": "Black",
                    "size": "30",
                    "notes": "Black shorts"
                },
                {
                    "id": 13,
                    "name": "White Sneakers",
                    "brand": "Specs",
                    "category": "Footwear",
                    "color": "White",
                    "size": "42",
                    "notes": "Soccer cleats"
                }
            ]
        }
    ],
    "wardrobeSize": 13
});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = Clothing;
