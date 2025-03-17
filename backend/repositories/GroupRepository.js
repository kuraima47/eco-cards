const { Group } = require('../models');

class GroupRepository {
    async findAll() {
        return await Group.findAll();
    }

    async findById(id) {
        return await Group.findByPk(id);
    }

    async getGroupsBySessionId(sessionId) {
        return await Group.findAll({ where: { sessionId } });
    }

    async create(groupData) {
        return await Group.create(groupData);
    }

    async update(id, groupData) {
        const group = await Group.findByPk(id);
        if (group) {
            return await group.update(groupData);
        }
        return null;
    }

    async delete(id) {
        const group = await Group.findByPk(id);
        if (group) {
            await group.destroy();
            return true;
        }
        return false;
    }
}

module.exports = new GroupRepository();
