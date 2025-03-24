const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const Card = require('../../models/Card');
const cardService = require('../../services/CardService');

chai.use(sinonChai);

describe('Card Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllCards', () => {
        it('should return all cards', async () => {
            const mockCards = [
                { 
                    cardId: 1, 
                    cardName: 'Test Card 1',
                    cardActual: 'Actual 1',
                    cardProposition: 'Prop 1',
                    cardImageData: 'image1.jpg',
                    cardCategoryId: 10,
                    cardValue: 10,
                    times_selected: 0
                },
                { 
                    cardId: 2, 
                    cardName: 'Test Card 2',
                    cardActual: 'Actual 2',
                    cardProposition: 'Prop 2',
                    cardImageData: 'image2.jpg',
                    cardCategoryId: 20,
                    cardValue: 20,
                    times_selected: 2
                }
            ];
            
            sandbox.stub(Card, 'findAll').resolves(mockCards);
            
            const result = await cardService.getAllCards();
            
            expect(Card.findAll).to.have.been.calledOnce;
            expect(result).to.deep.equal(mockCards);
        });

        it('should handle database errors when getting all cards', async () => {
            const error = new Error('Database error');
            sandbox.stub(Card, 'findAll').rejects(error);
            
            try {
                await cardService.getAllCards();
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getCardById', () => {
        it('should return a specific card by id', async () => {
            const mockCard = { 
                cardId: 1, 
                cardName: 'Test Card',
                cardActual: 'Current situation',
                cardProposition: 'Proposed change',
                cardImageData: 'image.jpg',
                cardCategoryId: 10,
                cardValue: 15,
                times_selected: 1
            };
            sandbox.stub(Card, 'findByPk').resolves(mockCard);
            
            const result = await cardService.getCardById(1);
            
            expect(Card.findByPk).to.have.been.calledWith(1);
            expect(result).to.deep.equal(mockCard);
        });

        it('should return null when card not found', async () => {
            sandbox.stub(Card, 'findByPk').resolves(null);
            
            const result = await cardService.getCardById(999);
            
            expect(Card.findByPk).to.have.been.calledWith(999);
            expect(result).to.be.null;
        });
    });

    // Uncomment and update if you decide to include createCard tests
    /*
    describe('createCard', () => {
        it('should create a new card successfully', async () => {
            const newCardData = {
                cardName: 'New Card',
                cardActual: 'Current situation',
                cardProposition: 'Proposed change',
                cardImageData: 'image.jpg',
                cardCategoryId: 30,
                cardValue: 25,
                times_selected: 0
            };
            
            const createdCard = { cardId: 3, ...newCardData };
            sandbox.stub(Card, 'create').resolves(createdCard);
            
            const result = await cardService.createCard(newCardData);
            
            expect(Card.create).to.have.been.calledWith(newCardData);
            expect(result).to.deep.equal(createdCard);
        });

        it('should handle validation errors when creating a card', async () => {
            const newCardData = {
                cardName: 'New Card'
                // Missing required fields
            };
            
            const error = new Error('Invalid cardActual');
            sandbox.stub(Card, 'create').rejects(error);
            
            try {
                await cardService.createCard(newCardData);
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err.message).to.equal('Invalid cardActual');
            }
        });
    });
    */

    describe('updateCard', () => {
        it('should update a card successfully', async () => {
            const updateData = {
                cardName: 'Updated Card Name',
                cardActual: 'Updated situation',
                cardProposition: 'Updated proposition',
                cardImageData: 'updated.jpg',
                cardCategoryId: 40,
                cardValue: 30
            };
            
            const mockCard = {
                cardId: 1,
                ...updateData,
                times_selected: 1,
                update: sandbox.stub().resolves({
                    cardId: 1,
                    ...updateData,
                    times_selected: 1
                })
            };
            
            sandbox.stub(Card, 'findByPk').resolves(mockCard);
            
            const result = await cardService.updateCard(1, updateData);
            
            expect(Card.findByPk).to.have.been.calledWith(1);
            expect(mockCard.update).to.have.been.calledWith(updateData);
            expect(result).to.deep.equal({
                cardId: 1,
                ...updateData,
                times_selected: 1
            });
        });

        it('should return null when card not found for update', async () => {
            sandbox.stub(Card, 'findByPk').resolves(null);
            
            const result = await cardService.updateCard(999, {
                cardName: 'Updated Name',
                cardActual: 'Updated situation',
                cardProposition: 'Updated proposition',
                cardImageData: 'updated.jpg',
                cardCategoryId: 40,
                cardValue: 30
            });
            
            expect(Card.findByPk).to.have.been.calledWith(999);
            expect(result).to.be.null;
        });
    });

    describe('deleteCard', () => {
        it('should delete a card successfully', async () => {
            const mockCard = {
                cardId: 1,
                cardName: 'Test Card',
                destroy: sandbox.stub().resolves(true)
            };
            
            sandbox.stub(Card, 'findByPk').resolves(mockCard);
            
            const result = await cardService.deleteCard(1);
            
            expect(Card.findByPk).to.have.been.calledWith(1);
            expect(mockCard.destroy).to.have.been.calledOnce;
            expect(result).to.be.true;
        });

        it('should return false when card not found for deletion', async () => {
            sandbox.stub(Card, 'findByPk').resolves(null);
            
            const result = await cardService.deleteCard(999);
            
            expect(Card.findByPk).to.have.been.calledWith(999);
            expect(result).to.be.false;
        });
    });
});
