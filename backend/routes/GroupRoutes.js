const express = require('express');
const groupController = require('../controllers/GroupController');

const router = express.Router();

router.get('/', groupController.getAllGroups);
router.get('/:id', groupController.getGroupById);
router.get('/session/:sessionId', groupController.getGroupsBySessionId);
router.post('/', groupController.createGroup);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

module.exports = router;