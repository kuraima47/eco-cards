const express = require('express');
const authController = require('../controllers/AuthController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Définir le rate limiter pour la route /register
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite chaque IP à 5 requêtes par fenêtre de 15 minutes
    handler: (req, res) => {
        res.status(429).json({
            error: 'Trop de comptes créés à partir de cette IP, veuillez réessayer après 15 minutes'
        });
    }
});

router.post('/register', registerLimiter, authController.register);
router.post('/login', authController.login);

module.exports = router;