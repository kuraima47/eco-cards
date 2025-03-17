const { GroupAcceptedCard } = require('../models');

class GroupAcceptedCardRepository {
    async findAll() {
        return await GroupAcceptedCard.findAll();
    }

    async findByGroupId(groupId) {
        return await GroupAcceptedCard.findAll({ where: { groupId } });
    }

    async create(groupAcceptedCardData) {
        return await GroupAcceptedCard.create(groupAcceptedCardData);
    }

    async delete(groupId, cardId) {
        const groupAcceptedCard = await GroupAcceptedCard.findOne({ where: { groupId, cardId } });
        if (groupAcceptedCard) {
            await groupAcceptedCard.destroy();
            return true;
        }
        return false;
    }
}

module.exports = new GroupAcceptedCardRepository();