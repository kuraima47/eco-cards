const CategoryRepository = require('../repositories/CategoryRepository');

class CategoryService {
    async getAllCategories() {
        return await CategoryRepository.findAll();
    }

    async getCategoriesByDeckId(deckId) {
        return await CategoryRepository.findByDeckId(deckId);
    }

    async getCategoryById(id) {
        return await CategoryRepository.findById(id);
    }

    async createCategory(categoryData) {
        this.validateCategoryData(categoryData);
        return await CategoryRepository.create(categoryData);
    }
    async getCategoryDeckContents(categoryId,deckId) {
        return await CategoryRepository.getCategoryDeckContents(categoryId,deckId);
    }
    async updateCategory(id, categoryData) {
        this.validateCategoryData(categoryData);
        return await CategoryRepository.update(id, categoryData);
    }

    async deleteCategory(id) {
        return await CategoryRepository.delete(id);
    }

    async validateCategoryData(categoryData) {
        if (!categoryData.categoryName) {
            throw new Error('Invalid categoryName');
        }
        if (categoryData.categoryName.length < 1) {
            throw new Error('Invalid categoryName');
        }
        if (categoryData.categoryName.length > 50) {
            throw new Error('categoryName is too long');
        }
        // Only check length if categoryDescription exists
        if (categoryData.categoryDescription !== undefined && 
            categoryData.categoryDescription !== null && 
            categoryData.categoryDescription.length > 255) {
            throw new Error('categoryDescription is too long');
        }
        // Validate categoryColor as a hexadecimal color
        if (categoryData.categoryColor !== "" && !/^#[0-9A-Fa-f]{6}$/i.test(categoryData.categoryColor)) {
            throw new Error('Invalid categoryColor');
        }
        // Validate iconName as a non-empty string
        if (categoryData.iconName !== undefined && categoryData.iconName !== null && typeof categoryData.iconName !== 'string') {
            throw new Error('Invalid iconName');
        }
    }
}

module.exports = new CategoryService();