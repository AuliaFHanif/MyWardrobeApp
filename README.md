# Individual Project Phase 2
# 👗 Outfit Generator API

Welcome to the documentation for the Outfit Generator API. This service provides endpoints for user authentication, wardrobe management, and AI-powered outfit suggestions based on user data and real-time weather.

## 🔑 Authentication and Authorization

All protected routes require a JSON Web Token (JWT) provided in the request header.

### Middleware

| Middleware | Description |
| :--- | :--- |
| `authentication` | Checks for a valid JWT in the `Authorization: Bearer <token>` header. If valid, sets `req.user` with user information. Required for all protected routes. |
| `verifyRole` | Checks if the authenticated user has the necessary role (e.g., `'admin'` or `'premium user'`) to perform the action. |

## 🚀 Getting Started

### Base URL

All endpoints are relative to your service's base URL.

### Authentication Flow

1.  Use the `/login` or `/loginGoogle` endpoint to receive a JWT.
2.  Include this token in the `Authorization` header for all protected requests: `Authorization: Bearer [YOUR_JWT_TOKEN]`

## 🔐 Authentication Endpoints

These endpoints are used for user login, sign-up, and obtaining the access token.

| Method | Endpoint | Description | Request Body Example | Success Response (200) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/login` | Authenticates a user using email and password. | `{"email": "user@example.com", "password": "password123"}` | `{"token": "JWT_TOKEN_HERE"}` |
| `POST` | `/loginGoogle` | Authenticates a user using a Google Sign-In token. | `{"google_token": "google_oauth_token_here"}` | `{"token": "JWT_TOKEN_HERE"}` |
| `POST` | `/add-user` | Creates a new user account. **(Protected: Requires `verifyRole`)** | `{"email": "new@user.com", "password": "secure", "role": "basic"}` | `{"id": 1, "email": "new@user.com"}` |

## 🌎 Public Endpoints

These routes are publicly accessible and do not require authentication.

### 👚 Clothing Item Lookups

| Method | Endpoint | Description | Query Parameters | Success Response (200) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/pub/clothingItems` | Retrieves a list of general/public clothing items (if applicable). | N/A | `[{"id": 1, "name": "General T-Shirt", ...}]` |
| `GET` | `/clothingItems/:id` | Retrieves the detailed information for a specific clothing item. | N/A | `{"id": 1, "name": "...", "description": "...", ...}` |

### 📋 Static Data/Lookup Endpoints

| Method | Endpoint | Description | Success Response (200) |
| :--- | :--- | :--- | :--- |
| `GET` | `/brands` | Retrieves a list of all available clothing brands. | `[{"id": 1, "brand_name": "Nike"}, {"id": 2, "brand_name": "Adidas"}, ...]` |
| `GET` | `/colors` | Retrieves a list of all available clothing colors. | `[{"id": 1, "color_name": "Red"}, {"id": 2, "color_name": "Blue"}, ...]` |
| `GET` | `/types` | Retrieves a list of all available clothing types (e.g., T-shirt, Dress, Sneaker). | `[{"id": 1, "type_name": "T-Shirt"}, {"id": 2, "type_name": "Footwear"}, ...]` |

## 👤 Protected User Wardrobe Endpoints

These endpoints require the `authentication` middleware.

### 💾 Wardrobe Management

| Method | Endpoint | Description | Request Body/File | Success Response (200/201) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/clothing` | Retrieves the authenticated user's personal wardrobe inventory. | N/A | `[{"id": 101, "name": "...", "material": "...", ...}]` |
| `POST` | `/clothing/add` | Adds a new clothing item to the authenticated user's wardrobe. | `{"name": "...", "brandId": 1, "colorId": 2, "typeId": 3, ...}` | `{"id": 102, "message": "Item added successfully"}` |
| `PUT` | `/clothing/:id` | Edits the details of an existing clothing item. **(Protected: Requires `verifyRole`)** | `{"name": "New Name", "material": "Cotton", ...}` | `{"message": "Item updated successfully"}` |
| `DELETE` | `/clothing/:id` | Deletes a clothing item from the wardrobe. **(Protected: Requires `verifyRole`)** | N/A | `{"message": "Item deleted successfully"}` |

### 🖼️ Image and Usage Updates

| Method | Endpoint | Description | Request Body/File | Success Response (200) |
| :--- | :--- | :--- | :--- | :--- |
| `PATCH` | `/clothing/:id/cover-url` | Updates the image/cover URL for a clothing item. | **File Upload:** Multipart form data with a file in the `imgUrl` field. | `{"message": "Image updated successfully"}` |
| `POST` | `/clothing/last-used` | Updates the `last_used` timestamp for a specific clothing item. | `{"clothingItemId": 101}` | `{"message": "Last used date updated"}` |

### ✨ AI-Powered Outfit Suggestions

| Method | Endpoint | Description | Request Body Example | Success Response (200) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/clothing/suggestions` | Generates 3 AI-powered outfit suggestions based on user wardrobe, location, and criteria. | `{"userId": 1, "occasion": "Casual", "lat": -6.2, "lon": 106.8, "stylePreference": "Minimalist"}` | `{"success": true, "criteria": {...}, "suggestions": [...]}` |
| `GET` | `/clothing/suggestionsDummy` | Retrieves a dummy/placeholder response for outfit suggestions (for development/testing). | N/A | `{"success": true, "suggestions": [...]}` (Dummy data) |

## 🚨 Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. Errors are returned in a standardized JSON format.

| HTTP Status Code | Description |
| :--- | :--- |
| **400 Bad Request** | Missing required parameters (e.g., `email` in login, `occasion` in suggestions). |
| **401 Unauthorized** | Missing or invalid authentication token. |
| **403 Forbidden** | Authenticated user lacks the necessary role (Authorization failure). |
| **404 Not Found** | Resource not found (e.g., clothing item ID does not exist). |
| **500 Internal Server Error** | A general server-side issue (database error, external API failure, unhandled exception). |
