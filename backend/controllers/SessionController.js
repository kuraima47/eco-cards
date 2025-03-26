const sessionService = require('../services/SessionService');
const userService = require('../services/UserService');

class SessionController {
    async getAllSessions(req, res) {
        try {
            const sessions = await sessionService.getAllSessions();
            res.json(sessions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSessionById(req, res) {
        try {
            const session = await sessionService.getSessionById(req.params.id);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json(session);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createSession(req, res) {
        try {
            const session = await sessionService.createSession(req.body);
            res.status(201).json(session);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateSession(req, res) {
        try {
            const session = await sessionService.updateSession(req.params.id, req.body);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json(session);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateSessionStatus(req, res) {
        try {
            const session = await sessionService.updateSessionStatus(req.params.id, req.body.status);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json(session);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSessionsByStatus(req, res) {
        try {
            const sessions = await sessionService.getSessionsByStatus(req.params.status);
            res.json(sessions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteSession(req, res) {
        try {
            const session = await sessionService.deleteSession(req.params.id);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json({ message: 'Session deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    //envoyer un lien par mail à un utilisateur pour rejoindre une session avec son mail
    async sendLinkToUser(req, res) {
        try {
            const user = await userService.getUserByEmail(req.body.email);
            if (user) {
                return res.status(400).json({ error: 'Email Already exist' });
            }
            const session = await sessionService.sendLinkToUser(req.params.id, req.body.email);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json({ message: 'Link sent successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
}

module.exports = new SessionController();