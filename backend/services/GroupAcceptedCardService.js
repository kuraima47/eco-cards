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
    async updateCO2Estimation(groupId, cardId, value) {
        return groupAcceptedCardRepository.upsert(groupId, cardId, {
          co2estimation: value
        });
      }
    
    async updateAcceptanceLevel(groupId, cardId, level) {
        return groupAcceptedCardRepository.upsert(groupId, cardId, {
          acceptancelevel: level
        });
      }
    async deleteGroupAcceptedCard(groupId, cardId) {
        return await groupAcceptedCardRepository.delete(groupId, cardId);
    }
}

module.exports = new GroupAcceptedCardService();