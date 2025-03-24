const groupPlayerService = require('../services/GroupPlayerService');

class GroupPlayerController {
    async getAllGroupPlayers(req, res) {
        const groupPlayers = await groupPlayerService.getAllGroupPlayers();
        res.json(groupPlayers);
    }

    async getGroupPlayersByGroupId(req, res) {
        const groupPlayers = await groupPlayerService.getGroupPlayersByGroupId(req.params.groupId);
        res.json(groupPlayers);
    }

    async createGroupPlayer(req, res) {
        const newGroupPlayer = await groupPlayerService.createGroupPlayer(req.body);
        res.status(201).json(newGroupPlayer);
    }

    async deleteGroupPlayer(req, res) {
        const success = await groupPlayerService.deleteGroupPlayer(req.params.groupId, req.params.username);
        res.status(success ? 204 : 404).send();
    }
}

module.exports = new GroupPlayerController();