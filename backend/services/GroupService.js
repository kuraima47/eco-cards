const groupRepository = require('../repositories/GroupRepository');

class GroupService {
    async getAllGroups() {
        return await groupRepository.findAll();
    }

    async getGroupById(id) {
        return await groupRepository.findById(id);
    }

    async getGroupsBySessionId(sessionId) {
        return await groupRepository.getGroupsBySessionId(sessionId);
    }

    async createGroup(groupData) {
        return await groupRepository.create(groupData);
    }

    async updateGroup(id, groupData) {
        return await groupRepository.update(id, groupData);
    }

    async deleteGroup(id) {
        return await groupRepository.delete(id);
    }
}

module.exports = new GroupService();