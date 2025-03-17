const { Session } = require('../models');
require ('dotenv').config();
const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
const AuthService = require("../services/AuthService");

function  generateSessionCredentials() {
    return {
        id: Math.random().toString(36).substring(2, 10),
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
        // Vérification de la session (désactivée ici)
        // const session = await Session.findByPk(id);
        // if (!session) {
        //     console.log("Session introuvable");
        //     return false;
        // }
        
        // Génération des identifiants
        const credentials = generateSessionCredentials();
        const sessionLink = `https://localhost/login/${id}`;
    
        // 🔹 Configuration du transporteur SMTP avec un mot de passe d'application
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,  // Ton adresse Gmail
                pass: process.env.PASSWORD,  // Ton mot de passe d'application
            },
        });
    
        const mailOptions = {
            from: `"Ecocards" <${process.env.EMAIL}>`,
            to: email,
            subject: "Invitation à rejoindre une session",
            html: `
                <p>Bonjour,</p>
                <p>Vous êtes invité à rejoindre une session de jeu.</p>
                <p><strong>Identifiants :</strong></p>
                <ul>
                    <li><strong>Username:</strong> ${credentials.id}</li>
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
                username: credentials.id.toString(),
                password: credentials.password.toString(),
            });//alternative à updateGroup
    
            return true;
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'e-mail :", error);
            return false;
        }
    }

    async joinSession(id, userId) {
        const session = await Session.findByPk(id);
        if (!session) {
            return false;
        }

        const users = session.users ? JSON.parse(session.users) : [];
        if (users.includes(userId)) {
            return false;
        }

        users.push(userId);
        return await session.update({ users: JSON.stringify(users) });
    }
}

module.exports = new SessionRepository();