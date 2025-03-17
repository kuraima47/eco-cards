const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const userService = require('../../services/UserService');
const userRepository = require('../../repositories/UserRepository');

chai.use(sinonChai);

describe('User Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const mockUsers = [
                { id: 1, name: 'User 1' },
                { id: 2, name: 'User 2' }
            ];
            
            sandbox.stub(userRepository, 'findAll').resolves(mockUsers);
            
            const result = await userService.getAllUsers();
            
            expect(userRepository.findAll).to.have.been.calledOnce;
            expect(result).to.deep.equal(mockUsers);
        });

        it('should handle errors when getting all users', async () => {
            const error = new Error('Database error');
            sandbox.stub(userRepository, 'findAll').rejects(error);
            
            try {
                await userService.getAllUsers();
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getUserById', () => {
        it('should return a specific user', async () => {
            const mockUser = { id: 1, name: 'User 1' };
            sandbox.stub(userRepository, 'findById').resolves(mockUser);
            
            const result = await userService.getUserById(1);
            
            expect(userRepository.findById).to.have.been.calledWith(1);
            expect(result).to.deep.equal(mockUser);
        });
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const newUser = { name: 'New User' };
            const createdUser = { id: 1, ...newUser };
            sandbox.stub(userRepository, 'create').resolves(createdUser);
            
            const result = await userService.createUser(newUser);
            
            expect(userRepository.create).to.have.been.calledWith(newUser);
            expect(result).to.deep.equal(createdUser);
        });
    });

    describe('updateUser', () => {
        it('should update a user', async () => {
            const updateData = { name: 'Updated User' };
            const updatedUser = { id: 1, ...updateData };
            sandbox.stub(userRepository, 'update').resolves(updatedUser);
            
            const result = await userService.updateUser(1, updateData);
            
            expect(userRepository.update).to.have.been.calledWith(1, updateData);
            expect(result).to.deep.equal(updatedUser);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            sandbox.stub(userRepository, 'delete').resolves(true);
            
            const result = await userService.deleteUser(1);
            
            expect(userRepository.delete).to.have.been.calledWith(1);
            expect(result).to.be.true;
        });
    });
});