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
        // Ensure you have access to the verifyToken function
        const data = verifyToken(accessToken); 
        
        // --- Input Parameters (Filters and Pagination) ---
        const category = req.query.category || "";
        const brand_id = req.query.brand_id || "";
        const color_id = req.query.color_id || "";
        const sortBy = req.query.sort || "createdAt";
        const sortOrder = req.query.order || "DESC";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;

        // --- Execute Query with FindAndCountAll ---
        // findAndCountAll returns an object: { count: totalItems, rows: clothingItems }
        const { count: totalItems, rows: clothingItems } = await ClothingItem.findAndCountAll({
            limit,
            offset,
            where: { user_id: data.id }, // Security: Filter by logged-in user ID
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

        // 3. Return the items AND the total count
        res.status(200).json({
            items: clothingItems,
            totalItems: totalItems,
            currentPage: page,
            limit: limit
        });

    } catch (error) {
        console.error("Error in getClothingItemPersonal:", error);
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
            notes 
        } = req.body;

        const bearerToken = req.headers.authorization;
        const accessToken = bearerToken.split(" ")[1];
        const data = verifyToken(accessToken);

        const [updatedRows] = await ClothingItem.update(
            {
                type_id,
                brand_id,
                color_id,
                size,
                material,
                last_used,
                image_url,
                notes

            },
            {
                where: {
                    id: itemId,
                    user_id: data.id 
                }
            }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ message: "Item not found/you are not authorized to edit it" });
        }

        res.status(200).json({ message: "Clothing item updated successfully" });

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
        attributes: ["id", "size", "material", "notes", "image_url"],
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

  static async updateLastUsed(req, res, next) {
    try {
        // 1. Get the array of IDs from the request body
        const { itemIds } = req.body;

        // Input validation: Ensure itemIds is an array and not empty
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ error: "itemIds array is required." });
        }

        // 2. Perform the update using Sequelize's Model.update method
        const [affectedRows] = await ClothingItem.update(
            { last_used: new Date() }, // 1st Argument: The new values to set
            { 
                where: { 
                    id: itemIds // 2nd Argument: The WHERE clause (id IN (itemIds))
                } 
            }
        );

        // Optional: Check if any rows were actually updated
        if (affectedRows === 0) {
             return res.status(404).json({ message: "No items found or updated." });
        }

        res.status(200).json({ 
            message: "Last used dates updated successfully",
            updatedCount: affectedRows
        });

    } catch (error) {
        console.error("Error updating last used date:", error);
        // Respond with a detailed error message (for debugging)
        res.status(500).json({ 
            error: "Failed to update last used dates.",
            details: error.message 
        });
    }
}

  static async getOutfitSuggestionsDummy(req, res, next) {
    try {
      
      res.status(200).json({
    "success": true,
    "criteria": {
        "occasion": "Date Night",
        "weather": "Mild evening",
        "stylePreference": "Romantic and stylish"
    },
    "suggestions": [
        {
            "outfit_name": "Evening Elegance",
            "items": [
                38,
                5,
                34,
                6
            ],
            "description": "This outfit combines the soft sophistication of the light gray blouse with the classic appeal of navy jeans, elevated by a sharp navy blazer. The color palette is understated yet chic, perfect for a romantic evening. The blouse adds a touch of fluidity and elegance, while the blazer provides structure and warmth for a mild evening.",
            "style_tips": "Tuck the blouse neatly into the jeans for a polished silhouette. Roll up the blazer sleeves slightly to reveal your wrists for a relaxed yet stylish touch. While black sneakers aren't typically 'romantic,' choose the sleekest pair and ensure they are impeccably clean to maintain a sophisticated casual vibe. Consider minimalist accessories to complete the refined look.",
            "itemDetails": [
                {
                    "id": 38,
                    "name": "Light Gray Blouse",
                    "brand": "Erigo",
                    "category": "Tops",
                    "color": "Light Gray",
                    "size": "M",
                    "image_url": "https://picsum.photos/400?random=4",
                    "notes": "Work polo shirt"
                },
                {
                    "id": 5,
                    "name": "Navy Blue Jeans",
                    "brand": "Levi's",
                    "category": "Bottoms",
                    "color": "Navy Blue",
                    "size": "34",
                    "image_url": "https://picsum.photos/400?random=5",
                    "notes": "Classic blue jeans"
                },
                {
                    "id": 34,
                    "name": "Navy Blue Blazer",
                    "brand": "Lacoste",
                    "category": "Outerwear",
                    "color": "Navy Blue",
                    "size": "L",
                    "image_url": "https://picsum.photos/400?random=20",
                    "notes": "Navy blue blazer for presentations"
                },
                {
                    "id": 6,
                    "name": "Black Sneakers",
                    "brand": "This Is April",
                    "category": "Footwear",
                    "color": "Black",
                    "size": "43",
                    "image_url": "https://picsum.photos/400?random=6",
                    "notes": "Formal dress shoes"
                }
            ]
        },
        {
            "outfit_name": "Polished Charm",
            "items": [
                4,
                5,
                34,
                20
            ],
            "description": "A fresh and confident choice, this outfit pairs a crisp white polo shirt with navy blue jeans. The addition of the navy blazer instantly transforms this business-casual staple into a stylish date night ensemble. It's a clean, classic, and put-together look that is both approachable and refined, suitable for a mild evening.",
            "style_tips": "For a 'romantic and stylish' feel, ensure the polo is well-fitted and possibly worn untucked if it's a shorter cut, or a neat half-tuck. Layer the blazer over the polo for an intelligent, refined appearance. The black leather sneakers, despite their 'formal' tag, can lend a modern, smart-casual edge if kept pristine. Add a belt that complements the sneakers for cohesion.",
            "itemDetails": [
                {
                    "id": 4,
                    "name": "White Polo Shirt",
                    "brand": "Polo Ralph Lauren",
                    "category": "Tops",
                    "color": "White",
                    "size": "L",
                    "image_url": "https://picsum.photos/400?random=4",
                    "notes": "Work polo shirt"
                },
                {
                    "id": 5,
                    "name": "Navy Blue Jeans",
                    "brand": "Levi's",
                    "category": "Bottoms",
                    "color": "Navy Blue",
                    "size": "34",
                    "image_url": "https://picsum.photos/400?random=5",
                    "notes": "Classic blue jeans"
                },
                {
                    "id": 34,
                    "name": "Navy Blue Blazer",
                    "brand": "Lacoste",
                    "category": "Outerwear",
                    "color": "Navy Blue",
                    "size": "L",
                    "image_url": "https://picsum.photos/400?random=20",
                    "notes": "Navy blue blazer for presentations"
                },
                {
                    "id": 20,
                    "name": "Black Sneakers",
                    "brand": "This Is April",
                    "category": "Footwear",
                    "color": "Black",
                    "size": "43",
                    "image_url": "https://picsum.photos/400?random=6",
                    "notes": "Formal dress shoes"
                }
            ]
        },
        {
            "outfit_name": "Modern Romantic",
            "items": [
                40,
                5,
                34,
                6
            ],
            "description": "This look focuses on a striking red sweater, a color often associated with romance, paired with classic navy jeans. The unusual 'leather' material of the sweater, if sleek, adds an edgy and luxurious texture, making it uniquely stylish. Layering the navy blazer over the sweater provides structure, warmth, and a sophisticated contrast, ideal for a mild evening date.",
            "style_tips": "Let the red sweater be the focal point of this outfit. Depending on the sweater's cut, you might wear it slightly oversized for a cozy-chic feel, or fitted for a sharper look. If the 'leather' material is substantial, ensure the blazer fits comfortably over it. The black sneakers ground the vibrant top, creating a balanced and modern aesthetic. Keep accessories minimal to let the rich color and texture shine.",
            "itemDetails": [
                {
                    "id": 40,
                    "name": "Red Sweater",
                    "brand": "Greenlight",
                    "category": "Tops",
                    "color": "Red",
                    "size": "43",
                    "image_url": "https://picsum.photos/400?random=6",
                    "notes": "Formal dress shoes"
                },
                {
                    "id": 5,
                    "name": "Navy Blue Jeans",
                    "brand": "Levi's",
                    "category": "Bottoms",
                    "color": "Navy Blue",
                    "size": "34",
                    "image_url": "https://picsum.photos/400?random=5",
                    "notes": "Classic blue jeans"
                },
                {
                    "id": 34,
                    "name": "Navy Blue Blazer",
                    "brand": "Lacoste",
                    "category": "Outerwear",
                    "color": "Navy Blue",
                    "size": "L",
                    "image_url": "https://picsum.photos/400?random=20",
                    "notes": "Navy blue blazer for presentations"
                },
                {
                    "id": 6,
                    "name": "Black Sneakers",
                    "brand": "This Is April",
                    "category": "Footwear",
                    "color": "Black",
                    "size": "43",
                    "image_url": "https://picsum.photos/400?random=6",
                    "notes": "Formal dress shoes"
                }
            ]
        }
    ],
    "wardrobeSize": 11
});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = Clothing;
