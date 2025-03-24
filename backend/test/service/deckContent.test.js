const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const deckContentService = require('../../services/DeckContentService');
const deckContentRepository = require('../../repositories/DeckContentRepository');

chai.use(sinonChai);

describe('DeckContent Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllDeckContents', () => {
        it('should return all deck contents', async () => {
            const mockDeckContents = [
                { deckId: 1, cardId: 1 },
                { deckId: 1, cardId: 2 }
            ];
            
            sandbox.stub(deckContentRepository, 'findAll').resolves(mockDeckContents);
            
            const result = await deckContentService.getAllDeckContents();
            
            expect(deckContentRepository.findAll).to.have.been.calledOnce;
            expect(result).to.deep.equal(mockDeckContents);
        });

        it('should handle errors when getting all deck contents', async () => {
            const error = new Error('Database error');
            sandbox.stub(deckContentRepository, 'findAll').rejects(error);
            
            try {
                await deckContentService.getAllDeckContents();
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getDeckContentsByDeckId', () => {
        it('should return deck contents for a specific deck', async () => {
            const mockDeckContents = [
                { deckId: 1, cardId: 1 },
                { deckId: 1, cardId: 2 }
            ];
            
            sandbox.stub(deckContentRepository, 'findByDeckId').resolves(mockDeckContents);
            
            const result = await deckContentService.getDeckContentsByDeckId(1);
            
            expect(deckContentRepository.findByDeckId).to.have.been.calledWith(1);
            expect(result).to.deep.equal(mockDeckContents);
        });
    });

    describe('createDeckContent', () => {
        it('should create a new deck content', async () => {
            const newDeckContent = { deckId: 1, cardId: 1 };
            sandbox.stub(deckContentRepository, 'create').resolves(newDeckContent);
            
            const result = await deckContentService.createDeckContent(newDeckContent);
            
            expect(deckContentRepository.create).to.have.been.calledWith(newDeckContent);
            expect(result).to.deep.equal(newDeckContent);
        });
    });

    describe('deleteDeckContent', () => {
        it('should delete a deck content', async () => {
            sandbox.stub(deckContentRepository, 'delete').resolves(true);
            
            const result = await deckContentService.deleteDeckContent(1, 1);
            
            expect(deckContentRepository.delete).to.have.been.calledWith(1, 1);
            expect(result).to.be.true;
        });
    });
});