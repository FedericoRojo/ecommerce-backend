const {Router} = require('express');
const categoryController = require('../controllers/categoryController.js');
const passport = require('passport');
const {isAdmin} = require('../middleware/userMiddleware.js');
const {upload} = require('./multerConfig.js');

const categoryRouter = Router();


categoryRouter.get('/', categoryController.getCategories);

categoryRouter.get('/:id', categoryController.getCategory);

categoryRouter.post('/new', passport.authenticate('jwt', {session: false}), isAdmin ,categoryController.createCategory);
categoryRouter.put('/:id', passport.authenticate('jwt', {session: false}), isAdmin, categoryController.updateCategory);
categoryRouter.delete('/:id', passport.authenticate('jwt', {session: false}), isAdmin, categoryController.deleteCategory);



module.exports = categoryRouter;