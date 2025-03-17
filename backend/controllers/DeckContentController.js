const deckContentService = require('../services/DeckContentService');

class DeckContentController {
    async getAllDeckContents(req, res) {
        const deckContents = await deckContentService.getAllDeckContents();
        res.json(deckContents);
    }

    async getDeckContentsByDeckId(req, res) {
        const deckContents = await deckContentService.getDeckContentsByDeckId(req.params.deckId);
        res.json(deckContents);
    }

    async createDeckContent(req, res) {
        const newDeckContent = await deckContentService.createDeckContent(req.body);
        res.status(201).json(newDeckContent);
    }

    async deleteDeckContent(req, res) {
        const success = await deckContentService.deleteDeckContent(req.params.deckId, req.params.cardId);
        res.status(success ? 204 : 404).send();
    }
}

module.exports = new DeckContentController();