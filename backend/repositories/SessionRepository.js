const { Session } = require('../models');
require ('dotenv').config();
const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
const AuthService = require("../services/AuthService");
const UserService = require("../services/UserService");
const { Group, GroupPlayer } = require("../models")
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

    async sendLinkToUser(id, email)
    {
      // Vérification de la session
      const session = await Session.findByPk(id)
      if (!session) {
        console.log("Session introuvable")
        return false;
      }
    
      // Génération des identifiants
      const credentials = generateSessionCredentials()
      const sessionLink = process.env.CORS_ORIGIN
    
      // Configuration du transporteur SMTP
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      })
    
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
      }
    

      try {
        await transporter.sendMail(mailOptions)
    
        // Register or find existing user
        let user = await UserService.getUserByEmail(email)
        if (!user) {
          user = await AuthService.register({
            email: email,
            username: email,
            password: credentials.password.toString(),
          })
        }
    

        const groups = await Group.findAll({ 
          where: { sessionId: id },
          include: [{
            model: GroupPlayer,
            where: { username: email, userId: null },
            required: false
          }]
        })
    
        // Update existing group player entries
        for (const group of groups) {
          const existingPlayer = group.GroupPlayers?.find(p => p.username === email)
          if (existingPlayer) {
            await GroupPlayer.update(
              { userId: user.userId },
              { where: { groupPlayerId: existingPlayer.groupPlayerId } }
            )
            console.log(`Updated existing player ${email} in group ${group.groupId}`)
            return true
          }
        }
    
        // Fallback: Add to first group if no existing entry found
        if (groups.length > 0) {
          await GroupPlayer.create({
            groupId: groups[0].groupId,
            userId: user.userId,
            username: email,
          })
          console.log(`Added ${email} to first group as fallback`)
        }
    
        return true
      } catch (error) {
        console.error("Error sending email or updating group:", error)
        return false
      }
    }
}

module.exports = new SessionRepository();