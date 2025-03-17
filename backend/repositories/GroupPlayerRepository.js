const { GroupPlayer } = require('../models');

class GroupPlayerRepository {
    async findAll() {
        return await GroupPlayer.findAll();
    }

    async findByGroupId(groupId) {
        return await GroupPlayer.findAll({ where: { groupId } });
    }

    async create(groupPlayerData) {
        return await GroupPlayer.create(groupPlayerData);
    }

    async delete(groupId, username) {
        return await GroupPlayer.destroy({
            where: {
                groupId,
                username
            }
        });
    }
}

module.exports = new GroupPlayerRepository();