const userService = require('../services/UserService');

class UserController {
    async getAllUsers(req, res) {
        const users = await userService.getAllUsers();
        res.json(users);
    }

    async getUserById(req, res) {
        const user = await userService.getUserById(req.params.id);
        res.json(user);
    }

    async createUser(req, res) {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    }

    async updateUser(req, res) {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.json(updatedUser);
    }

    async deleteUser(req, res) {
        const success = await userService.deleteUser(req.params.id);
        res.status(success ? 204 : 404).send();
    }
}

module.exports = new UserController();