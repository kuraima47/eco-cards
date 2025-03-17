const groupAcceptedCardRepository = require('../repositories/GroupAcceptedCardRepository');

class GroupAcceptedCardService {
    async getAllGroupAcceptedCards() {
        return await groupAcceptedCardRepository.findAll();
    }

    async getGroupAcceptedCardsByGroupId(groupId) {
        return await groupAcceptedCardRepository.findByGroupId(groupId);
    }

    async createGroupAcceptedCard(groupAcceptedCardData) {
        return await groupAcceptedCardRepository.create(groupAcceptedCardData);
    }

    async deleteGroupAcceptedCard(groupId, cardId) {
        return await groupAcceptedCardRepository.delete(groupId, cardId);
    }
}

module.exports = new GroupAcceptedCardService();