const express = require('express');
const groupPlayerController = require('../controllers/GroupPlayerController');

const router = express.Router();

router.get('/', groupPlayerController.getAllGroupPlayers);
router.get('/group/:groupId', groupPlayerController.getGroupPlayersByGroupId);
router.post('/', groupPlayerController.createGroupPlayer);
router.delete('/:groupId/:username', groupPlayerController.deleteGroupPlayer);

module.exports = router;