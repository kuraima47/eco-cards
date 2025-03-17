const { Category } = require('../models');

class CategoryRepository {
    async findAll() {
        return await Category.findAll();
    }

    async findById(id) {
        return await Category.findByPk(id);
    }

    async getCategoryDeckContents(categoryId,deckId) {
        return await DeckContent.findOne({
            where: { id: categoryId },
            include: {
              model: Deck,
              where: { id: deckId }
            }
          });
    }

    async findByDeckId(deckId) {
        return await Category.findAll({
            where: {
                deckId: deckId
            }
        });
    }

    async create(categoryData) {
        if (!Category || typeof Category.create !== 'function') {
          throw new Error('Category model not properly initialized');
        }
        
        try {
          return await Category.create(categoryData);
        } catch (error) {
          console.error('Database error creating category:', error);
          throw error;
        }
      }

    async update(id, categoryData) {
        const category = await Category.findByPk(id);
        if (category) {
            return await category.update(categoryData);
        }
        return null;
    }

    async delete(id) {
        const category = await Category.findByPk(id);
        if (category) {
            await category.destroy();
            return true;
        }
        return false;
    }
}

module.exports = new CategoryRepository();