const {Router} = require('express');
const orderController = require('../controllers/orderController.js');
const passport = require('passport');
//const {isAdmin} = require('../middleware/userMiddleware.js');
const {upload} = require('./multerConfig.js');

const orderRouter = Router();

orderRouter.post('/new', orderController.createOrder);
orderRouter.get('/:id', orderController.getOrder);
orderRouter.get('/', orderController.getOrders);

module.exports = orderRouter;