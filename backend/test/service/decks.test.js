const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const deckService = require('../../services/DeckService');
const deckRepository = require('../../repositories/DeckRepository');

chai.use(sinonChai);

describe('Deck Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllDecks', () => {
        it('should return all decks', async () => {
            const mockDecks = [
                { deckId: 1, deckName: 'Deck 1', adminId: 1 },
                { deckId: 2, deckName: 'Deck 2', adminId: 1 }
            ];
            
            sandbox.stub(deckRepository, 'findAll').resolves(mockDecks);
            
            const result = await deckService.getAllDecks();
            
            expect(deckRepository.findAll).to.have.been.calledOnce;
            expect(result).to.deep.equal(mockDecks);
        });

        it('should handle errors when getting all decks', async () => {
            const error = new Error('Database error');
            sandbox.stub(deckRepository, 'findAll').rejects(error);
            
            try {
                await deckService.getAllDecks();
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getDeckById', () => {
        it('should return a specific deck', async () => {
            const mockDeck = { deckId: 1, deckName: 'Deck 1', adminId: 1 };
            sandbox.stub(deckRepository, 'findById').resolves(mockDeck);
            
            const result = await deckService.getDeckById(1);
            
            expect(deckRepository.findById).to.have.been.calledWith(1);
            expect(result).to.deep.equal(mockDeck);
        });
    });

    describe('createDeck', () => {
        it('should create a new deck', async () => {
            const newDeck = { 
                deckName: 'New Deck',
                adminId: 1
            };
            const createdDeck = { deckId: 1, ...newDeck };
            sandbox.stub(deckRepository, 'create').resolves(createdDeck);
            
            const result = await deckService.createDeck(newDeck);
            
            expect(deckRepository.create).to.have.been.calledWith(newDeck);
            expect(result).to.deep.equal(createdDeck);
        });

        it('should validate required fields', async () => {
            const invalidDeck = { deckName: 'New Deck' }; // Missing adminId
            
            try {
                await deckService.createDeck(invalidDeck);
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err.message).to.equal('adminId is required');
            }
        });
    });

    describe('updateDeck', () => {
        it('should update a deck', async () => {
            const updateData = { deckName: 'Updated Deck' };
            const updatedDeck = { deckId: 1, deckName: 'Updated Deck', adminId: 1 };
            sandbox.stub(deckRepository, 'update').resolves(updatedDeck);
            
            const result = await deckService.updateDeck(1, updateData);
            
            expect(deckRepository.update).to.have.been.calledWith(1, updateData);
            expect(result).to.deep.equal(updatedDeck);
        });
    });

    describe('deleteDeck', () => {
        it('should delete a deck', async () => {
            sandbox.stub(deckRepository, 'delete').resolves(true);
            
            const result = await deckService.deleteDeck(1);
            
            expect(deckRepository.delete).to.have.been.calledWith(1);
            expect(result).to.be.true;
        });
    });
});