const express = require('express');
const deckContentController = require('../controllers/DeckContentController');

const router = express.Router();

router.get('/', deckContentController.getAllDeckContents);
router.get('/deck/:deckId', deckContentController.getDeckContentsByDeckId);
router.post('/', deckContentController.createDeckContent);
router.delete('/:deckId/:cardId', deckContentController.deleteDeckContent);

module.exports = router;