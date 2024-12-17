const {Router} = require('express');
const paymentController = require('../controllers/paymentController.js');
const passport = require('passport');
//const {isAdmin} = require('../middleware/userMiddleware.js');
const {upload} = require('./multerConfig.js');

const paymentRouter = Router();

paymentRouter.post('/new', paymentController.createPayment);
paymentRouter.get('/webhook', paymentController.receiveWebhook);

/* Routes for admin 
postRouter.get('/admin/posts', passport.authenticate("jwt", {session: false}), isAdmin, postController.getSomePostsAdmin);
*/


module.exports = paymentRouter;