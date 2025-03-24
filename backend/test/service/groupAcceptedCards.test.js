const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const groupAcceptedCardService = require('../../services/GroupAcceptedCardService');
const groupAcceptedCardRepository = require('../../repositories/GroupAcceptedCardRepository');

chai.use(sinonChai);

describe('GroupAcceptedCard Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllGroupAcceptedCards', () => {
        it('should return all group accepted cards', async () => {
            const mockCards = [
                { groupId: 1, cardId: 1 },
                { groupId: 1, cardId: 2 }
            ];
            
            sandbox.stub(groupAcceptedCardRepository, 'findAll').resolves(mockCards);
            
            const result = await groupAcceptedCardService.getAllGroupAcceptedCards();
            
            expect(groupAcceptedCardRepository.findAll).to.have.been.calledOnce;
            expect(result).to.deep.equal(mockCards);
        });

        it('should handle errors when getting all group accepted cards', async () => {
            const error = new Error('Database error');
            sandbox.stub(groupAcceptedCardRepository, 'findAll').rejects(error);
            
            try {
                await groupAcceptedCardService.getAllGroupAcceptedCards();
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getGroupAcceptedCardsByGroupId', () => {
        it('should return accepted cards for a specific group', async () => {
            const mockCards = [
                { groupId: 1, cardId: 1 },
                { groupId: 1, cardId: 2 }
            ];
            
            sandbox.stub(groupAcceptedCardRepository, 'findByGroupId').resolves(mockCards);
            
            const result = await groupAcceptedCardService.getGroupAcceptedCardsByGroupId(1);
            
            expect(groupAcceptedCardRepository.findByGroupId).to.have.been.calledWith(1);
            expect(result).to.deep.equal(mockCards);
        });
    });

    describe('createGroupAcceptedCard', () => {
        it('should create a new group accepted card', async () => {
            const newCard = { groupId: 1, cardId: 1 };
            sandbox.stub(groupAcceptedCardRepository, 'create').resolves(newCard);
            
            const result = await groupAcceptedCardService.createGroupAcceptedCard(newCard);
            
            expect(groupAcceptedCardRepository.create).to.have.been.calledWith(newCard);
            expect(result).to.deep.equal(newCard);
        });
    });

    describe('deleteGroupAcceptedCard', () => {
        it('should delete a group accepted card', async () => {
            sandbox.stub(groupAcceptedCardRepository, 'delete').resolves(true);
            
            const result = await groupAcceptedCardService.deleteGroupAcceptedCard(1, 1);
            
            expect(groupAcceptedCardRepository.delete).to.have.been.calledWith(1, 1);
            expect(result).to.be.true;
        });
    });
});
