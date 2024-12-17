const {Router} = require('express');
const productController = require('../controllers/productController.js');
const passport = require('passport');
const {isAdmin} = require('../middleware/userMiddleware.js');
const {upload} = require('./multerConfig.js');

const productRouter = Router();

productRouter.get('/search', productController.getProductsByQuery);

productRouter.get('/:id', productController.getProduct);
productRouter.post('/new',  passport.authenticate("jwt", {session: false}), isAdmin, upload.single('file'), productController.createProduct);
productRouter.put('/:id', passport.authenticate("jwt", {session: false}), isAdmin, upload.single('file'), productController.updateProduct);
productRouter.delete('/:id', passport.authenticate("jwt", {session: false}), isAdmin, productController.deleteProduct)

productRouter.get('/', productController.getProducts);
productRouter.get('/category/:categoryID', productController.getProductsByCategory);





module.exports = productRouter;