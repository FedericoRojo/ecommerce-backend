const {Router} = require('express');
const shipmentController = require('../controllers/shipmentController.js');
const passport = require('passport');
//const {isAdmin} = require('../middleware/userMiddleware.js');
const {upload} = require('./multerConfig.js');

const shipmentRouter = Router();


/* Routes for admin 
postRouter.get('/admin/posts', passport.authenticate("jwt", {session: false}), isAdmin, postController.getSomePostsAdmin);
*/


module.exports = shipmentRouter;