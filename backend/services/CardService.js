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
        const requiredFields = ['cardName', 'cardActual', 'cardProposition', 'cardImage', 'cardCategoryId', 'cardValue', 'qrCodeColor', 'qrCodeLogoImage', 'backgroundColor'];
        return requiredFields.every(field => card[field] !== null && card[field] !== undefined && card[field] !== '');
    }

    validateCardData(cardData) {

        if (cardData.cardName.length > 64) {
            throw new Error('Invalid cardName (size > 64)');
        }

        if (cardData.description.length > 1000) { // Limite arbitraire pour TEXT
            throw new Error('Invalid cardDescription (size > 1000)');
        }

        if (cardData.cardActual.length > 500) {
            throw new Error('Invalid cardActual (size > 500)');
        }

        if (cardData.cardProposition.length > 500) {
            throw new Error('Invalid cardProposition (size > 500)');
        }

        if (cardData.cardImageData && !(cardData.cardImageData instanceof Buffer)) {
            throw new Error('Invalid cardImageData (must be a Buffer or null)');
        }

        if (cardData.cardCategoryId !== null && (typeof cardData.cardCategoryId !== 'number' || cardData.cardCategoryId <= 0)) {
            throw new Error('Invalid cardCategoryId (must be a positive integer or null)');
        }

        if (!cardData.cardValue && (typeof cardData.cardValue !== 'number' || cardData.cardValue < 0)) {
            throw new Error('Invalid cardValue (not a number)');
        }

        if (cardData.times_selected !== undefined && (typeof cardData.times_selected !== 'number' || cardData.times_selected < 0)) {
            throw new Error('Invalid times_selected (must be a non-negative integer)');
        }

        if (cardData.qrCodeLogoImageData && !(cardData.qrCodeLogoImageData instanceof Buffer)) {
            console.log("cardData.qrCodeLogoImageData", cardData.cardImageData, cardData.qrCodeLogoImageData);
            throw new Error('Invalid qrCodeLogoImageData (must be a Buffer or null)', cardData.qrCodeLogoImageData);
        }

        // Validate qrCodeColor as a hexadecimal color
        if (cardData.qrCodeColor !== "" && !/^#[0-9A-Fa-f]{6}$/i.test(cardData.qrCodeColor)) {
            throw new Error('Invalid qrCodeColor');
        }

        // Validate qrCodeColor as a hexadecimal color
        if (cardData.backgroundColor !== "" && !/^#[0-9A-Fa-f]{6}$/i.test(cardData.backgroundColor)) {
            throw new Error('Invalid backgroundColor');
        }
    }
}

module.exports = new CardService();