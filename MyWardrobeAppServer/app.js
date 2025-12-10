require('dotenv').config()
const multer = require("multer")
const express = require('express');
const cors = require('cors')
const Clothing = require('./controllers/ClothingControllers.js');
const Users = require('./controllers/UserControllers.js');
const Brand = require('./controllers/BrandController.js');
const Color = require('./controllers/ColorController.js');
const authentication = require('./middlewares/authentication.js')
const verifyRole = require('./middlewares/authorization.js')
const errorHandler = require('./middlewares/errorHandler.js')

const app = express();

app.use(cors())

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get('/pub/clothingItems', Clothing.getClothingItemPublic);
app.get('/clothingItems/:id', Clothing.getClothingItemDetail);
app.get('/pub/brands', Brand.getAllBrands);
app.get('/pub/colors', Color.getAllColors);


app.post('/login', Users.login)
app.use(authentication)
app.post('/add-user', verifyRole, Users.createUser)

app.get('/clothing', Clothing.getClothingItemPersonal);
app.post('/clothing/add', Clothing.addClothingItem);
app.put('/clothing/:id', verifyRole, Clothing.editClothingItem);
app.delete('/clothing/:id', verifyRole, Clothing.deleteClothingItem);
app.patch("/clothing/:id/cover-url", verifyRole, upload.single('imgUrl'), Clothing.editClothingItemImage);


app.use(errorHandler)

module.exports = app