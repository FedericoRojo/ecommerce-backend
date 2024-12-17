const {Router} = require('express');
const cartController = require('../controllers/cartController.js');
const passport = require('passport');

const cartRouter = Router();

cartRouter.post('/new', passport.authenticate('jwt', {session: false}), cartController.createCart);
cartRouter.get('/', passport.authenticate('jwt', {session: false}), cartController.getCart);
cartRouter.post('/',  passport.authenticate('jwt', {session: false}), cartController.addToCart);
cartRouter.put('/update', passport.authenticate('jwt', {session: false}), cartController.updateCart); //Updating quantity

cartRouter.delete('/:productID', passport.authenticate('jwt', {session: false}), cartController.removeFromCart);

cartRouter.put('/empty', passport.authenticate('jwt', {session: false}), cartController.emptyCart);

module.exports = cartRouter;