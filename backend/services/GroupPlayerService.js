const groupPlayerRepository = require('../repositories/GroupPlayerRepository');

class GroupPlayerService {
    async getAllGroupPlayers() {
        return await groupPlayerRepository.findAll();
    }

    async getGroupPlayersByGroupId(groupId) {
        return await groupPlayerRepository.findByGroupId(groupId);
    }

    async createGroupPlayer(groupPlayerData) {
        return await groupPlayerRepository.create(groupPlayerData);
    }

    async deleteGroupPlayer(groupId, username) {
        return await groupPlayerRepository.delete(groupId, username);
    }
}

module.exports = new GroupPlayerService();