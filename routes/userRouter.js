const {Router} = require("express");
const userController = require("../controllers/userController");
const {upload} = require('./multerConfig.js');
const passport = require("passport");
const {isAdmin} = require('../middleware/userMiddleware.js');


const userRouter = Router();

userRouter.post('/register', userController.registerUser);
userRouter.post('/login', userController.loginUser);
userRouter.get('/auth', passport.authenticate("jwt", {session: false}), userController.validUser);



module.exports = userRouter;