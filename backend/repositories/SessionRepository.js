const { Session } = require('../models');
require ('dotenv').config();
const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
const AuthService = require("../services/AuthService");

function  generateSessionCredentials() {
    return {
        password: Math.random().toString(36).substring(2, 10),
    };
}

class SessionRepository {
    async findAll() {
        return await Session.findAll();
    }

    async findById(id) {
        return await Session.findByPk(id);
    }

    async findByStatus(status) {
        return await Session.findAll({ where: { status } });
    }
    async updateStatus(id, status) {
        const session = await Session.findByPk(id);
        if (session) {
            return await session.update({ status });
        }
        return null;
    }

    async create(sessionData) {
        return await Session.create(sessionData);
    }

    async update(id, sessionData) {
        const session = await Session.findByPk(id);
        if (session) {
            return await session.update(sessionData);
        }
        return null;
    }

    async delete(id) {
        const session = await Session.findByPk(id);
        if (session) {
            await session.destroy();
            return true;
        }
        return false;
    }

    async sendLinkToUser(id, email) {
        //Vérification de la session (désactivée ici)
        const session = await Session.findByPk(id);
        if (!session) {
            console.log("Session introuvable");
            return false;
        }
        // Génération des identifiants
        const credentials = generateSessionCredentials();
        const sessionLink = `https://localhost:3001/games/${id}/phase/0`;
    
        // 🔹 Configuration du transporteur SMTP avec un mot de passe d'application
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,  
                pass: process.env.PASSWORD, 
            },
        });
    
        const mailOptions = {
            from: `"Ecocards" <${process.env.EMAIL}>`,
            to: email,
            subject: "Invitation à rejoindre une session",
            html: `
                <p>Bonjour,</p>
                <p>Vous êtes invité à rejoindre la session de jeu ${session.sessionName}.</p>
                <p><strong>Identifiants :</strong></p>
                <ul>
                    <li><strong>Username:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${credentials.password}</li>
                </ul>
                <p><a href="${sessionLink}">Cliquez ici pour vous connecter</a></p>
                <p>Cordialement,</p>
                <p>Équipe Ecocards</p>
            `,
        };
    
        try {
            await transporter.sendMail(mailOptions);
            console.log("E-mail envoyé avec succès !");
            AuthService.register({
                email: email,
                username: email,
                password: credentials.password.toString(),
            });
    
            return true;
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'e-mail :", error);
            return false;
        }
    }
}

module.exports = new SessionRepository();