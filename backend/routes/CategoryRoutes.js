const express = require('express');
const CategoryController = require('../controllers/CategoryController');

const router = express.Router();

router.get('/', CategoryController.getAllCategories);
router.get('/deck/:deckId', CategoryController.getCategoriesByDeckId);
router.get('/:id', CategoryController.getCategoryById);
router.get('/:id/cards', CategoryController.getCategoryDeckContents);
router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;