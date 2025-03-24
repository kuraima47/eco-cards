const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const Category = require('../../models/Category');
const categoryService = require('../../services/CategoryService');

chai.use(sinonChai);

describe('Category Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllCategories', () => {
        it('should return all categories', async () => {
            const mockCategories = [
                { 
                    categoryId: 1, 
                    categoryName: 'Category 1',
                    categoryDescription: 'Description 1',
                    categoryColor: '#FFFFFF',
                    categoryIcon: 'icon-1',
                    deckId: 1
                },
                { 
                    categoryId: 2, 
                    categoryName: 'Category 2',
                    categoryDescription: 'Description 2',
                    categoryColor: '#FFFFFF',
                    categoryIcon: 'icon-2',
                    deckId: 1
                }
            ];
            
            sandbox.stub(Category, 'findAll').resolves(mockCategories);
            
            const result = await categoryService.getAllCategories();
            
            expect(Category.findAll).to.have.been.calledOnce;
            expect(result).to.deep.equal(mockCategories);
        });

        it('should handle database errors when getting all categories', async () => {
            const error = new Error('Database error');
            sandbox.stub(Category, 'findAll').rejects(error);
            
            try {
                await categoryService.getAllCategories();
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getCategoryById', () => {
        it('should return a specific category by id', async () => {
            const mockCategory = { 
                categoryId: 1, 
                categoryName: 'Test Category',
                categoryDescription: 'Test Description',
                categoryColor: '#FFFFFF',
                categoryIcon: 'icon-test',
                deckId: 1
            };
            sandbox.stub(Category, 'findByPk').resolves(mockCategory);
            
            const result = await categoryService.getCategoryById(1);
            
            expect(Category.findByPk).to.have.been.calledWith(1);
            expect(result).to.deep.equal(mockCategory);
        });

        it('should return null when category not found', async () => {
            sandbox.stub(Category, 'findByPk').resolves(null);
            
            const result = await categoryService.getCategoryById(999);
            
            expect(Category.findByPk).to.have.been.calledWith(999);
            expect(result).to.be.null;
        });
    });

    describe('getCategoriesByDeckId', () => {
        it('should return all categories for a specific deck', async () => {
            const mockCategories = [
                { 
                    categoryId: 1, 
                    categoryName: 'Category 1',
                    categoryDescription: 'Description 1',
                    categoryColor: '#FFFFFF',
                    categoryIcon: 'icon-1',
                    deckId: 1
                },
                { 
                    categoryId: 2, 
                    categoryName: 'Category 2',
                    categoryDescription: 'Description 2',
                    categoryColor: '#FFFFFF',
                    categoryIcon: 'icon-2',
                    deckId: 1
                }
            ];
            
            sandbox.stub(Category, 'findAll').resolves(mockCategories);
            
            const result = await categoryService.getCategoriesByDeckId(1);
            
            expect(Category.findAll).to.have.been.calledWith({
                where: { deckId: 1 }
            });
            expect(result).to.deep.equal(mockCategories);
        });
    });

    describe('createCategory', () => {
        it('should create a new category successfully', async () => {
            const newCategoryData = {
                categoryName: 'New Category',
                categoryDescription: 'New Description',
                categoryColor: '#FFFFFF',
                categoryIcon: 'icon-new',
                deckId: 1
            };
            
            const createdCategory = { categoryId: 3, ...newCategoryData };
            sandbox.stub(Category, 'create').resolves(createdCategory);
            
            const result = await categoryService.createCategory(newCategoryData);
            
            expect(Category.create).to.have.been.calledWith(newCategoryData);
            expect(result).to.deep.equal(createdCategory);
        });

it('should handle validation errors when creating a category', async () => {
    const newCategoryData = {
        // Missing required fields such as categoryName
        categoryDescription: 'New Description',
        deckId: 1
    };
    
    const error = new Error('Missing required field: categoryName');
    sandbox.stub(Category, 'create').rejects(error);
    
    try {
        await categoryService.createCategory(newCategoryData);
        expect.fail('Expected an error to be thrown');
    } catch (err) {
        expect(err.message).to.equal('Missing required field: categoryName');
    }
});
    });

    describe('updateCategory', () => {
        it('should update a category successfully', async () => {
            const updateData = {
                categoryName: 'Updated Category Name',
                categoryDescription: 'Updated Description',
                categoryColor: '#CCCCCC',
                categoryIcon: 'icon-updated'
            };
            
            const mockCategory = {
                categoryId: 1,
                categoryName: 'Old Category Name',
                categoryDescription: 'Old Description',
                categoryColor: '#FFFFFF',
                categoryIcon: 'icon-old',
                deckId: 1,
                update: sandbox.stub().resolves({
                    categoryId: 1,
                    categoryName: 'Updated Category Name',
                    categoryDescription: 'Updated Description',
                    categoryColor: '#CCCCCC',
                    categoryIcon: 'icon-updated',
                    deckId: 1
                })
            };
            
            sandbox.stub(Category, 'findByPk').resolves(mockCategory);
            
            const result = await categoryService.updateCategory(1, updateData);
            
            expect(Category.findByPk).to.have.been.calledWith(1);
            expect(mockCategory.update).to.have.been.calledWith(updateData);
            expect(result).to.deep.equal({
                categoryId: 1,
                categoryName: 'Updated Category Name',
                categoryDescription: 'Updated Description',
                categoryColor: '#CCCCCC',
                categoryIcon: 'icon-updated',
                deckId: 1
            });
        });

        it('should return null when category not found for update', async () => {
            sandbox.stub(Category, 'findByPk').resolves(null);
            
            const result = await categoryService.updateCategory(999, {
                categoryName: 'Updated Name',
                categoryDescription: 'Updated Description',
                categoryColor: '#CCCCCC',
                categoryIcon: 'icon-updated'
            });
            
            expect(Category.findByPk).to.have.been.calledWith(999);
            expect(result).to.be.null;
        });
    });

    describe('deleteCategory', () => {
        it('should delete a category successfully', async () => {
            const mockCategory = {
                categoryId: 1,
                categoryName: 'Test Category',
                destroy: sandbox.stub().resolves(true)
            };
            
            sandbox.stub(Category, 'findByPk').resolves(mockCategory);
            
            const result = await categoryService.deleteCategory(1);
            
            expect(Category.findByPk).to.have.been.calledWith(1);
            expect(mockCategory.destroy).to.have.been.calledOnce;
            expect(result).to.be.true;
        });

        it('should return false when category not found for deletion', async () => {
            sandbox.stub(Category, 'findByPk').resolves(null);
            
            const result = await categoryService.deleteCategory(999);
            
            expect(Category.findByPk).to.have.been.calledWith(999);
            expect(result).to.be.false;
        });
    });
});
