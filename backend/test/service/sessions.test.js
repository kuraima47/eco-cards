const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect } = chai;
const sessionService = require('../../services/SessionService');
const sessionRepository = require('../../repositories/SessionRepository');

chai.use(sinonChai);

describe('Session Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllSessions', () => {
        it('should return all sessions', async () => {
            const mockSessions = [
                { sessionId: 1, sessionName: 'Session 1' },
                { sessionId: 2, sessionName: 'Session 2' }
            ];
            
            sandbox.stub(sessionRepository, 'findAll').resolves(mockSessions);
            
            const result = await sessionService.getAllSessions();
            
            expect(sessionRepository.findAll).to.have.been.calledOnce;
            expect(result).to.deep.equal(mockSessions);
        });

        it('should handle errors when getting all sessions', async () => {
            const error = new Error('Database error');
            sandbox.stub(sessionRepository, 'findAll').rejects(error);
            
            try {
                await sessionService.getAllSessions();
                expect.fail('Expected an error to be thrown');
            } catch (err) {
                expect(err).to.equal(error);
            }
        });
    });

    describe('getSessionById', () => {
        it('should return a specific session', async () => {
            const mockSession = { sessionId: 1, sessionName: 'Session 1' };
            sandbox.stub(sessionRepository, 'findById').resolves(mockSession);
            
            const result = await sessionService.getSessionById(1);
            
            expect(sessionRepository.findById).to.have.been.calledWith(1);
            expect(result).to.deep.equal(mockSession);
        });
    });

    describe('createSession', () => {
        it('should create a new session', async () => {
            const newSession = { sessionName: 'New Session', adminId: 1, deckId: 1 };
            const createdSession = { sessionId: 1, ...newSession };
            sandbox.stub(sessionRepository, 'create').resolves(createdSession);
            
            const result = await sessionService.createSession(newSession);
            
            expect(sessionRepository.create).to.have.been.calledWith(newSession);
            expect(result).to.deep.equal(createdSession);
        });
    });

    describe('updateSession', () => {
        it('should update a session', async () => {
            const updateData = { sessionName: 'Updated Session' };
            const updatedSession = { sessionId: 1, ...updateData };
            sandbox.stub(sessionRepository, 'update').resolves(updatedSession);
            
            const result = await sessionService.updateSession(1, updateData);
            
            expect(sessionRepository.update).to.have.been.calledWith(1, updateData);
            expect(result).to.deep.equal(updatedSession);
        });
    });

    describe('deleteSession', () => {
        it('should delete a session', async () => {
            sandbox.stub(sessionRepository, 'delete').resolves(true);
            
            const result = await sessionService.deleteSession(1);
            
            expect(sessionRepository.delete).to.have.been.calledWith(1);
            expect(result).to.be.true;
        });
    });
});
