const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/SessionController');

router.get('/', sessionController.getAllSessions);
router.get('/:id', sessionController.getSessionById);
router.post('/', sessionController.createSession);
router.put('/:id', sessionController.updateSession);
router.put('/:id/status', sessionController.updateSessionStatus);
router.get('/status/:status', sessionController.getSessionsByStatus);
router.delete('/:id', sessionController.deleteSession);
router.post('/:id/sendLink', sessionController.sendLinkToUser);

module.exports = router;