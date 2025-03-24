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
        const requiredFields = [
            'cardName',
            'cardActual',
            'cardProposition',
            'cardImage',
            'cardCategoryId',
            'cardValue',
            'qrCodeColor',
            'qrCodeLogoImage',
            'backgroundColor'
        ];
        return requiredFields.every(field => card[field] !== null && card[field] !== undefined && card[field] !== '');
    }

    validateCardData(cardData) {
        // Validate cardName
        if (!cardData.cardName || typeof cardData.cardName !== 'string') {
            throw new Error('Invalid cardName');
        }
        if (cardData.cardName.length > 64) {
            throw new Error('Invalid cardName (size > 64)');
        }

        // Validate cardDescription if provided
        if (cardData.cardDescription !== undefined && cardData.cardDescription !== null) {
            if (typeof cardData.cardDescription !== 'string') {
                throw new Error('Invalid cardDescription');
            }
            if (cardData.cardDescription.length > 1000) {
                throw new Error('Invalid cardDescription (size > 1000)');
            }
        }

        // Validate cardActual
        if (!cardData.cardActual || typeof cardData.cardActual !== 'string') {
            throw new Error('Invalid cardActual');
        }
        if (cardData.cardActual.length > 500) {
            throw new Error('Invalid cardActual (size > 500)');
        }

        // Validate cardProposition
        if (!cardData.cardProposition || typeof cardData.cardProposition !== 'string') {
            throw new Error('Invalid cardProposition');
        }
        if (cardData.cardProposition.length > 500) {
            throw new Error('Invalid cardProposition (size > 500)');
        }

        // Validate cardImageData: allow string, Buffer, or null/undefined
        if (cardData.cardImageData !== undefined && cardData.cardImageData !== null && 
            !(typeof cardData.cardImageData === 'string' || cardData.cardImageData instanceof Buffer)) {
            throw new Error('Invalid cardImageData (must be a Buffer, a string, or null)');
        }

        // Validate cardCategoryId if provided
        if (cardData.cardCategoryId !== undefined && cardData.cardCategoryId !== null) {
            if (typeof cardData.cardCategoryId !== 'number' || cardData.cardCategoryId <= 0) {
                throw new Error('Invalid cardCategoryId (must be a positive integer or null)');
            }
        }

        // Validate cardValue (must be provided and non-negative)
        if (cardData.cardValue === undefined || cardData.cardValue === null || typeof cardData.cardValue !== 'number' || cardData.cardValue < 0) {
            throw new Error('Invalid cardValue (not a number)');
        }

        // Validate times_selected if provided
        if (cardData.times_selected !== undefined) {
            if (typeof cardData.times_selected !== 'number' || cardData.times_selected < 0) {
                throw new Error('Invalid times_selected (must be a non-negative integer)');
            }
        }

        // Validate qrCodeLogoImageData if provided: allow string, Buffer, or null/undefined
        if (cardData.qrCodeLogoImageData !== undefined && cardData.qrCodeLogoImageData !== null && 
            !(typeof cardData.qrCodeLogoImageData === 'string' || cardData.qrCodeLogoImageData instanceof Buffer)) {
            throw new Error('Invalid qrCodeLogoImageData (must be a Buffer, a string, or null)');
        }

        // Validate qrCodeColor if provided (empty string allowed)
        if (cardData.qrCodeColor && !/^#[0-9A-Fa-f]{6}$/.test(cardData.qrCodeColor)) {
            throw new Error('Invalid qrCodeColor');
        }

        // Validate backgroundColor if provided (empty string allowed)
        if (cardData.backgroundColor && !/^#[0-9A-Fa-f]{6}$/.test(cardData.backgroundColor)) {
            throw new Error('Invalid backgroundColor');
        }
    }
}

module.exports = new CardService();
