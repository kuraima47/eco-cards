const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const groupPlayerService = require('../../services/GroupPlayerService');
const groupPlayerRepository = require('../../repositories/GroupPlayerRepository');

chai.use(sinonChai);

describe('GroupPlayer Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllGroupPlayers', () => {
        it('should return all group players', async () => {
            const mockPlayers = [
                { groupId: 1, userId: 1 },
                { groupId: 1, userId: 2 }
            ];
            
            sandbox.stub(groupPlayerRepository, 'findAll').resolves(mockPlayers);
            
            const result = await groupPlayerService.getAllGroupPlayers();
            
            expect(groupPlayerRepository.findAll).to.have.been.calledOnce;
            expect(result).to.deep.equal(mockPlayers);
        });

        it('should handle errors when getting all group players', async () => {
            const error = new Error('Database error');
            sandbox.stub(groupPlayerRepository, 'findAll').rejects(error);
            
            try {
                await groupPlayerService.getAllGroupPlayers();
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getGroupPlayersByGroupId', () => {
        it('should return players for a specific group', async () => {
            const mockPlayers = [
                { groupId: 1, userId: 1 },
                { groupId: 1, userId: 2 }
            ];
            
            sandbox.stub(groupPlayerRepository, 'findByGroupId').resolves(mockPlayers);
            
            const result = await groupPlayerService.getGroupPlayersByGroupId(1);
            
            expect(groupPlayerRepository.findByGroupId).to.have.been.calledWith(1);
            expect(result).to.deep.equal(mockPlayers);
        });
    });

    describe('createGroupPlayer', () => {
        it('should create a new group player', async () => {
            const newPlayer = { groupId: 1, userId: 1 };
            sandbox.stub(groupPlayerRepository, 'create').resolves(newPlayer);
            
            const result = await groupPlayerService.createGroupPlayer(newPlayer);
            
            expect(groupPlayerRepository.create).to.have.been.calledWith(newPlayer);
            expect(result).to.deep.equal(newPlayer);
        });
    });

    describe('deleteGroupPlayer', () => {
        it('should delete a group player', async () => {
            sandbox.stub(groupPlayerRepository, 'delete').resolves(true);
            
            const result = await groupPlayerService.deleteGroupPlayer(1, 1);
            
            expect(groupPlayerRepository.delete).to.have.been.calledWith(1, 1);
            expect(result).to.be.true;
        });
    });
});