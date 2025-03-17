const express = require('express');
const deckController = require('../controllers/DeckController');

const router = express.Router();

router.get('/', deckController.getAllDecks);
router.get('/:id', deckController.getDeckById);
router.get('/:id/cards', deckController.getCardsInDeck);
router.post('/', deckController.createDeck);
router.post('/:id/cards/:cardId', deckController.addCardToDeck);
router.put('/:id', deckController.updateDeck);
router.delete('/:id', deckController.deleteDeck);
router.delete('/:id/cards/:cardId', deckController.removeCardFromDeck);

module.exports = router;