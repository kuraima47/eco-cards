const sessionRepository = require('../repositories/SessionRepository');

class SessionService {
    async getAllSessions() {
        return await sessionRepository.findAll();
    }

    async getSessionById(id) {
        return await sessionRepository.findById(id);
    }

    async createSession(sessionData) {
        return await sessionRepository.create(sessionData);
    }

    async updateSession(id, sessionData) {
        return await sessionRepository.update(id, sessionData);
    }
    async updateSessionStatus(id, status) {
        return await sessionRepository.update(id, { status });
    }
    async getSessionsByStatus(status) {
        return await sessionRepository.findByStatus(status);
    }
    async deleteSession(id) {
        return await sessionRepository.delete(id);
    }

    async sendLinkToUser(id,email){
        return await sessionRepository.sendLinkToUser(id,email);
    }

    //join session
    async joinSession(id,userId){
        return await sessionRepository.joinSession(id,userId);
    }
}

module.exports = new SessionService();