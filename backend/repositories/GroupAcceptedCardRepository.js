const GroupAcceptedCard = require('../models/GroupAcceptedCard');

class GroupAcceptedCardRepository {
    async findAll() {
        return await GroupAcceptedCard.findAll();
    }

    async findByGroupId(groupId) {
        return await GroupAcceptedCard.findAll({
            where: { groupId }
        });
    }

    async create(groupAcceptedCardData) {
        return await GroupAcceptedCard.create(groupAcceptedCardData);
    }

    async upsert(groupId, cardId, data) {
        const [record] = await GroupAcceptedCard.findOrCreate({
            where: { groupId, cardId },
            defaults: { groupId, cardId, ...data }
        });
        
        if (!record.isNewRecord) {
            await record.update(data);
        }
        
        return record;
    }

    async delete(groupId, cardId) {
        const groupAcceptedCard = await GroupAcceptedCard.findOne({ where: { groupId, cardId } });
        if (groupAcceptedCard) {
            await groupAcceptedCard.destroy();
        }
        return true;
    }
}

module.exports = new GroupAcceptedCardRepository();