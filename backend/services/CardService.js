const cardRepository = require('../repositories/CardRepository');

class CardService {
    async getAllCards() {
        return await cardRepository.findAll();
    }

    async getCardById(id) {
        return await cardRepository.findById(id);
    }

    async createCard(cardData) {
        try {
            this.validateCardData(cardData);
            return await cardRepository.create(cardData);
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                const messages = error.errors.map(e => e.message);
                throw new Error(messages.join(', '));
            }
            throw error;
        }
    }

    async updateCard(id, cardData) {
        try {
            this.validateCardData(cardData);
            return await cardRepository.update(id, cardData);
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                const messages = error.errors.map(e => e.message);
                throw new Error(messages.join(', '));
            }
            throw error;
        }
    }

    async deleteCard(id) {
        return await cardRepository.delete(id);
    }

    async isCardComplete(id) {
        const card = await cardRepository.findById(id);
        if (!card) {
            return false;
        }
        const requiredFields = ['cardName', 'cardActual', 'cardProposition', 'cardImage', 'cardCategoryId', 'cardValue'];
        return requiredFields.every(field => card[field] !== null && card[field] !== undefined && card[field] !== '');
    }

    validateCardData(cardData) {

        if (cardData.cardName.length > 64) {
            throw new Error('Invalid cardName (size > 64)');
        }
        if (cardData.cardActual.length > 500) {
            throw new Error('Invalid cardActual (size > 500)');
        }
        if (cardData.cardProposition.length > 500) {
            throw new Error('Invalid cardProposition (size > 500)');
        }
        // if (cardData.cardCategory.length > 24 || !cardData.cardCategory && typeof cardData.cardCategoryId !== 'number') {
        //     throw new Error('Invalid cardCategory (size > 24)');
        // }
        if (!cardData.cardValue && typeof cardData.cardValue !== 'number') {
            throw new Error('Invalid cardValue (not a number)');
        }
    }

    isValidCardData(cardData) {
        return !(cardData.cardName.length < 1 || cardData.cardName.length > 64 ||
            cardData.cardActual.length < 1 || cardData.cardActual.length > 500 ||
            cardData.cardProposition.length < 1 || cardData.cardProposition.length > 500 ||
            cardData.cardCategory.length < 1 || cardData.cardCategory.length > 24 ||
            typeof cardData.cardValue !== 'number' || cardData.cardValue < 0);
    }

    // isValidImagePath(imagePath) {
    //     return imagePath.startsWith('/assets/');
    // }
}

module.exports = new CardService();