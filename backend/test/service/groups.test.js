const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const groupService = require('../../services/GroupService');
const groupRepository = require('../../repositories/GroupRepository');

chai.use(sinonChai);

describe('Group Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllGroups', () => {
        it('should return all groups', async () => {
            const mockGroups = [
                { id: 1, name: 'Group 1' },
                { id: 2, name: 'Group 2' }
            ];
            
            sandbox.stub(groupRepository, 'findAll').resolves(mockGroups);
            
            const result = await groupService.getAllGroups();
            
            expect(groupRepository.findAll).to.have.been.calledOnce;
            expect(result).to.deep.equal(mockGroups);
        });

        it('should handle errors when getting all groups', async () => {
            const error = new Error('Database error');
            sandbox.stub(groupRepository, 'findAll').rejects(error);
            
            try {
                await groupService.getAllGroups();
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getGroupById', () => {
        it('should return a specific group', async () => {
            const mockGroup = { id: 1, name: 'Group 1' };
            sandbox.stub(groupRepository, 'findById').resolves(mockGroup);
            
            const result = await groupService.getGroupById(1);
            
            expect(groupRepository.findById).to.have.been.calledWith(1);
            expect(result).to.deep.equal(mockGroup);
        });
    });

    describe('createGroup', () => {
        it('should create a new group', async () => {
            const newGroup = { name: 'New Group' };
            const createdGroup = { id: 1, ...newGroup };
            sandbox.stub(groupRepository, 'create').resolves(createdGroup);
            
            const result = await groupService.createGroup(newGroup);
            
            expect(groupRepository.create).to.have.been.calledWith(newGroup);
            expect(result).to.deep.equal(createdGroup);
        });
    });

    describe('updateGroup', () => {
        it('should update a group', async () => {
            const updateData = { name: 'Updated Group' };
            const updatedGroup = { id: 1, ...updateData };
            sandbox.stub(groupRepository, 'update').resolves(updatedGroup);
            
            const result = await groupService.updateGroup(1, updateData);
            
            expect(groupRepository.update).to.have.been.calledWith(1, updateData);
            expect(result).to.deep.equal(updatedGroup);
        });
    });

    describe('deleteGroup', () => {
        it('should delete a group', async () => {
            sandbox.stub(groupRepository, 'delete').resolves(true);
            
            const result = await groupService.deleteGroup(1);
            
            expect(groupRepository.delete).to.have.been.calledWith(1);
            expect(result).to.be.true;
        });
    });
});