const { Card } = require('../models');

class CardRepository {
    async findAll() {
        return await Card.findAll();
    }

    async findById(id) {
        return await Card.findByPk(id);
    }

    async create(cardData) {
        return await Card.create(cardData);
    }

    async update(id, cardData) {
        const card = await Card.findByPk(id);
        if (card) {
            return await card.update(cardData);
        }
        return null;
    }

    

    async delete(id) {
        const card = await Card.findByPk(id);
        if (card) {
            await card.destroy();
            return true;
        }
        return false;
    }
}

module.exports = new CardRepository();