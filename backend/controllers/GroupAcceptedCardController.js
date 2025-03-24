const groupAcceptedCardService = require('../services/GroupAcceptedCardService');

class GroupAcceptedCardController {
    async getAllGroupAcceptedCards(req, res) {
        const groupAcceptedCards = await groupAcceptedCardService.getAllGroupAcceptedCards();
        res.json(groupAcceptedCards);
    }

    async getGroupAcceptedCardsByGroupId(req, res) {
        const groupAcceptedCards = await groupAcceptedCardService.getGroupAcceptedCardsByGroupId(req.params.groupId);
        res.json(groupAcceptedCards);
    }

    async createGroupAcceptedCard(req, res) {
        const newGroupAcceptedCard = await groupAcceptedCardService.createGroupAcceptedCard(req.body);
        res.status(201).json(newGroupAcceptedCard);
    }

    async deleteGroupAcceptedCard(req, res) {
        const success = await groupAcceptedCardService.deleteGroupAcceptedCard(req.params.groupId, req.params.cardId);
        res.status(success ? 204 : 404).send();
    }
}

module.exports = new GroupAcceptedCardController();