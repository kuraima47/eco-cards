const groupService = require('../services/GroupService');

class GroupController {
    async getAllGroups(req, res) {
        const groups = await groupService.getAllGroups();
        res.json(groups);
    }

    async getGroupById(req, res) {
        const group = await groupService.getGroupById(req.params.id);
        res.json(group);
    }

    async getGroupsBySessionId(req, res) {
        const groups = await groupService.getGroupsBySessionId(req.params.sessionId);
        res.json(groups);
    }

    async createGroup(req, res) {
        const newGroup = await groupService.createGroup(req.body);
        res.status(201).json(newGroup);
    }

    async updateGroup(req, res) {
        const updatedGroup = await groupService.updateGroup(req.params.id, req.body);
        res.json(updatedGroup);
    }

    async deleteGroup(req, res) {
        const success = await groupService.deleteGroup(req.params.id);
        res.status(success ? 204 : 404).send();
    }
}

module.exports = new GroupController();