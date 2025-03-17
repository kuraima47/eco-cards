const { User } = require('../models');

class UserRepository {
    async findAll() {
        return await User.findAll();
    }

    async findById(id) {
        return await User.findByPk(id);
    }

    async create(userData) {
        return await User.create(userData);
    }

    async update(id, userData) {
        const user = await User.findByPk(id);
        if (user) {
            return await user.update(userData);
        }
        return null;
    }

    async delete(id) {
        const user = await User.findByPk(id);
        if (user) {
            await user.destroy();
            return true;
        }
        return false;
    }
}

module.exports = new UserRepository();