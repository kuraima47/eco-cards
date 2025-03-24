const CategoryService = require('../services/CategoryService');

class CategoryController {
    async getAllCategories(req, res) {
        try {
            const categories = await CategoryService.getAllCategories();
            res.json(categories);
        } catch (error) {
            console.error("Error retrieving categories:", error);
            res.status(500).json({ message: "Failed to retrieve categories", error: error.message });
        }
    }

    async getCategoriesByDeckId(req, res) {
        try {
            const categories = await CategoryService.getCategoriesByDeckId(req.params.deckId);
            res.json(categories);
        } catch (error) {
            console.error("Error retrieving categories:", error);
            res.status(500).json({ message: "Failed to retrieve categories", error: error.message });
        }
    }

    async getCategoryById(req, res) {
        try {
            const category = await CategoryService.getCategoryById(req.params.id);
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }
            res.json(category);
        } catch (error) {
            console.error("Error retrieving category:", error);
            res.status(500).json({ message: "Failed to retrieve category", error: error.message });
        }
    }

    async getCategoryDeckContents(req, res) {
        try {
            const { id: categoryId } = req.params;
            const deckContents = await CategoryService.getCategoryDeckContents(parseInt(categoryId));
            res.json(deckContents);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async createCategory(req, res) {
        console.log("Received POST request with body:", req.body);
        try {
            const newCategory = await CategoryService.createCategory(req.body);
            res.status(201).json(newCategory);
        } catch (error) {
            console.error("Error inserting category:", error);
            res.status(500).json({ message: "Failed to create category", error: error.message });
        }
    }

    async updateCategory(req, res) {
        try {
            const updatedCategory = await CategoryService.updateCategory(req.params.id, req.body);
            if (!updatedCategory) {
                return res.status(404).json({ message: "Category not found" });
            }
            res.json(updatedCategory);
        } catch (error) {
            console.error("Error updating category:", error);
            res.status(500).json({ message: "Failed to update category", error: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            const success = await CategoryService.deleteCategory(req.params.id);
            if (!success) {
                return res.status(404).json({ message: "Category not found" });
            }
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting category:", error);
            res.status(500).json({ message: "Failed to delete category", error: error.message });
        }
    }
}

module.exports = new CategoryController();