class Clothing {
    static async getClothingItemPublic(req, res, next) {
        try {
            
            res.status(200).json({ message: "Get all clothing items - public access" });
        } catch (error) {
            
        }
    }

    static async getClothingItemDetailPublic(req, res, next) {
        try {
            
        } catch (error) {
            
        }
    }

    static async addClothingItem(req, res, next) {
        try {
            
        } catch (error) {
            
        }
    }

    static async editClothingItem(req, res, next) {
        try {
            
        } catch (error) {
            
        }
    }

    static async deleteClothingItem(req, res, next) {
        try {
            
        } catch (error) {
            
        }
    }

    static async editClothingItemImage(req, res, next) {}
        
}

module.exports = Clothing;