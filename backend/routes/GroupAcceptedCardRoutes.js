const express = require('express');
const groupAcceptedCardController = require('../controllers/GroupAcceptedCardController');

const router = express.Router();

router.get('/', groupAcceptedCardController.getAllGroupAcceptedCards);
router.get('/group/:groupId', groupAcceptedCardController.getGroupAcceptedCardsByGroupId);
router.post('/', groupAcceptedCardController.createGroupAcceptedCard);
router.delete('/:groupId/:cardId', groupAcceptedCardController.deleteGroupAcceptedCard);

module.exports = router;