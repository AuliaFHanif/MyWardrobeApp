Middleware,Description
authentication,"Checks for a valid JWT in the Authorization: Bearer <token> header. If valid, sets req.user with user information. Required for all protected routes."
verifyRole,"Checks if the authenticated user has the necessary role (e.g., 'admin' or 'premium user') to perform the action. Currently applied to user management and specific clothing item modifications."

Method,Endpoint,Description,Request Body,Success Response (200)
POST,/login,Authenticates a user using email and password.,"{""email"": ""..."", ""password"": ""...""}","{""token"": ""JWT_TOKEN_HERE""}"
POST,/loginGoogle,Authenticates a user using a Google Sign-In token.,"{""google_token"": ""...""}","{""token"": ""JWT_TOKEN_HERE""}"
POST,/add-user,Creates a new user account. (Protected by authentication and verifyRole),"{""email"": ""..."", ""password"": ""..."", ""role"": ""...""}","{""id"": 1, ""email"": ""...""}"

Method,Endpoint,Description,Query Parameters,Success Response (200)
GET,/pub/clothingItems,Retrieves a list of public/general clothing items (if applicable).,N/A,"[{""id"": 1, ""name"": ""..."", ...}]"
GET,/clothingItems/:id,Retrieves the detailed information for a specific clothing item.,N/A,"{""id"": 1, ""name"": ""..."", ""description"": ""..."", ...}"

Method,Endpoint,Description,Success Response (200)
GET,/brands,Retrieves a list of all available clothing brands.,"[{""id"": 1, ""brand_name"": ""Nike""}, ...]"
GET,/colors,Retrieves a list of all available clothing colors.,"[{""id"": 1, ""color_name"": ""Red""}, ...]"
GET,/types,"Retrieves a list of all available clothing types (e.g., T-shirt, Dress, Sneaker).","[{""id"": 1, ""type_name"": ""T-Shirt""}, ...]"

Method,Endpoint,Description,Request Body/File,Success Response (200/201)
GET,/clothing,Retrieves the authenticated user's personal wardrobe inventory.,N/A,"[{""id"": 101, ""name"": ""..."", ""material"": ""..."", ...}]"
POST,/clothing/add,Adds a new clothing item to the authenticated user's wardrobe.,"{""name"": ""..."", ""brandId"": 1, ""colorId"": 2, ""typeId"": 3, ...}","{""id"": 102, ""message"": ""Item added successfully""}"
PUT,/clothing/:id,Edits the details of an existing clothing item. (Protected by verifyRole),"{""name"": ""New Name"", ""material"": ""Cotton"", ...}","{""message"": ""Item updated successfully""}"
PATCH,/clothing/:id/cover-url,Updates the image/cover URL for a clothing item. (Protected by verifyRole),File upload (via imgUrl field),"{""message"": ""Image updated successfully""}"
DELETE,/clothing/:id,Deletes a clothing item from the wardrobe. (Protected by verifyRole),N/A,"{""message"": ""Item deleted successfully""}"

Method,Endpoint,Description,Request Body,Success Response (200)
POST,/clothing/suggestions,"Generates 3 AI-powered outfit suggestions based on user wardrobe, location, and criteria.","{""userId"": 1, ""occasion"": ""Casual"", ""lat"": -6.2, ""lon"": 106.8, ""stylePreference"": ""Minimalist""}","{""success"": true, ""criteria"": {...}, ""suggestions"": [...]}"
GET,/clothing/suggestionsDummy,Retrieves a dummy/placeholder response for outfit suggestions (for development/testing).,N/A,"{""success"": true, ""suggestions"": [...]} (Dummy data)"

HTTP Status Code,Description
400 Bad Request,"Missing required parameters (e.g., email or password in login, occasion in suggestions)."
401 Unauthorized,Missing or invalid authentication token.
403 Forbidden,Authenticated user lacks the necessary role (verifyRole failure).
404 Not Found,"Resource not found (e.g., clothing item ID does not exist)."
500 Internal Server Error,"Server-side issue (database error, external API failure, unhandled exception)."
POST,/clothing/last-used,Updates the last_used timestamp for a specific clothing item.,"{""clothingItemId"": 101}","{""message"": ""Last used date updated""}"
