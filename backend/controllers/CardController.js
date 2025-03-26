const cardService = require('../services/CardService');
const { Category } = require('../models');

class CardController {
    
    async getAllCards(req, res) {
        try {
            const cards = await cardService.getAllCards();
            res.json(cards);
        } catch (error) {
            console.error("Error retrieving cards:", error);
            res.status(500).json({ message: "Failed to retrieve cards", error: error.message });
        }
    }

    async getCardById(req, res) {
        try {
            const card = await cardService.getCardById(req.params.id);
            if (!card) {
                return res.status(404).json({ message: "Card not found" });
            }
            const cardWithImage = {
                ...card,
                cardImageData: card.cardImageData ? card.cardImageData.toString('base64') : null,
                qrCodeLogoImageData: card.qrCodeLogoImageData ? card.qrCodeLogoImageData.toString('base64') : null
            };
            res.json(cardWithImage);
        } catch (error) {
            console.error("Error retrieving card:", error);
            res.status(500).json({ message: "Failed to retrieve card", error: error.message });
        }
    }

    /**
     * Convertit une image base64 en Buffer
     * @param {string} image - Image encodée en base64
     * @returns {Buffer} - Image décodée
     */
    async imageBase64ToBuffer(image) {
        if (image) {
            const base64Data = image.split(',')[1];
            return Buffer.from(base64Data, 'base64');
        } else return undefined;
    }

    async createCard(req, res) {
        console.log("Received POST request with body:", req.body);
        try {
            const { cardName, cardDescription, cardActual, cardProposition, category, cardValue, cardImage, deckId, qrCodeColor, qrCodeLogoImage, backgroundColor } = req.body;

            // Récupérer cardCategoryID à partir des infos envoyées
            const categoryRecord = await Category.findOne({
                where: {
                    categoryName: category,
                    deckId: deckId
                }
            });
            if (!categoryRecord) {
                return res.status(404).json({ message: "Category not found" });
            }
            const cardCategoryId = categoryRecord.categoryId;

            let cardImageData = imageBase64ToBuffer(cardImage);
            let qrCodeLogoImageData = imageBase64ToBuffer(qrCodeLogoImage);

            const newCard = await cardService.createCard({ cardName, cardDescription, cardActual, cardProposition, cardCategoryId, cardImageData, cardValue, qrCodeColor, qrCodeLogoImageData, backgroundColor });

            res.status(201).json(newCard);
        } catch (error) {
            console.error("Error inserting card:", error);
            res.status(500).json({ message: "Failed to create card", error: error.message });
        }
    }

    async updateCard(req, res) {
        try {
            const { cardName, cardDescription, cardActual, cardProposition, category, cardValue, cardImage, deckId, qrCodeColor, qrCodeLogoImage, backgroundColor } = req.body;

            // Récupérer cardCategoryID à partir des infos envoyées
            const categoryRecord = await Category.findOne({
                where: {
                    categoryName: category,
                    deckId: deckId
                }
            });
            if (!categoryRecord) {
                return res.status(404).json({ message: "Category not found" });
            }
            const cardCategoryId = categoryRecord.categoryId;

            let cardImageData = imageBase64ToBuffer(cardImage);
            let qrCodeLogoImageData = imageBase64ToBuffer(qrCodeLogoImage);

            const updatedCard = await cardService.updateCard(req.params.id, { cardName, cardDescription, cardActual, cardProposition, cardCategoryId, cardImageData, cardValue, qrCodeColor, qrCodeLogoImageData, backgroundColor });

            if (!updatedCard) {
                return res.status(404).json({ message: "Card not found" });
            }
            else {
                res.status(200).json(updatedCard);
            }
        } catch (error) {
            console.error("Error updating card:", error);
            res.status(500).json({ message: "Failed to update card", error: error.message });
        }
    }

    async deleteCard(req, res) {
        try {
            const success = await cardService.deleteCard(req.params.id);
            if (!success) {
                return res.status(404).json({ message: "Card not found" });
            }
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting card:", error);
            res.status(500).json({ message: "Failed to delete card", error: error.message });
        }
    }

    async isCardComplete(req, res) {
        const isComplete = await cardService.isCardComplete(req.params.id);
        res.json({ isComplete });
    }
}

/**
 * Convertit une image base64 en Buffer
 * @param {string} image - Image encodée en base64
 * @returns {Buffer} - Image décodée
 */
function imageBase64ToBuffer(image) {
    if (image) {
        const base64Data = image.split(',')[1];
        return Buffer.from(base64Data, 'base64');
    } else return undefined;
}

module.exports = new CardController();