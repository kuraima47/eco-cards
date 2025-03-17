const deckService = require('../services/DeckService');

class DeckController {
    async getAllDecks(req, res) {
        const decks = await deckService.getAllDecks();
        res.json(decks);
    }

    async getDeckById(req, res) {
        const deck = await deckService.getDeckById(req.params.id);
        res.json(deck);
    }

    async createDeck(req, res) {
        try {
            const { deckName, adminId } = req.body;
            
            if (!deckName || !adminId) {
                return res.status(400).json({
                    error: 'Missing required fields: deckName and adminId'
                });
            }

            const newDeck = await deckService.createDeck(req.body);
            res.status(201).json({
                message: 'Deck created successfully',
                data: newDeck
            });
        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }

    async updateDeck(req, res) {
        const updatedDeck = await deckService.updateDeck(req.params.id, req.body);
        res.json(updatedDeck);
    }

    async deleteDeck(req, res) {
        const success = await deckService.deleteDeck(req.params.id);
        res.status(success ? 204 : 404).send();
    }

    async addCardToDeck(req, res) {
        try {
            const { id: deckId, cardId } = req.params;
            const result = await deckService.addCardToDeck(parseInt(deckId), parseInt(cardId));
            res.status(201).json({
                message: 'Card added to deck successfully',
                data: result
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async removeCardFromDeck(req, res) {
        try {
            const { id: deckId, cardId } = req.params;
            const success = await deckService.removeCardFromDeck(parseInt(deckId), parseInt(cardId));
            res.status(success ? 204 : 404).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getCardsInDeck(req, res) {
        try {
            const { id: deckId } = req.params;
            const cards = await deckService.getCardsInDeck(parseInt(deckId));
            res.json(cards);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new DeckController();