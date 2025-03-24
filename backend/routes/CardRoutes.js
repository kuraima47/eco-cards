const express = require('express');
const cardController = require('../controllers/CardController');

const multer = require('multer');

/* POUR STOCKER DANS LE BACKEND */
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'assets/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now().toString() + file.originalname);
//     }
// })

const storage = multer.memoryStorage();
const upload = multer({ storage })

const router = express.Router();

router.get('/', cardController.getAllCards);
router.get('/:id', cardController.getCardById);
router.post('/', upload.single('file'), cardController.createCard);
router.put('/:id', upload.single('file'), cardController.updateCard);
router.delete('/:id', cardController.deleteCard);
router.get('/:id/complete', cardController.isCardComplete);

module.exports = router;