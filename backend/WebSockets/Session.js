const { Session, Group, GroupAcceptedCard, Card, Category, Deck } = require("../models");

module.exports = (io) => {
  io.of("/").on("connection", (socket) => {
    console.log("A user connected to the session");

    const getGroupAcceptedCards = async (groupId) => {
      const acceptedCards = await GroupAcceptedCard.findAll({
        where: { groupId },
        include: [Card]
      });
      return acceptedCards.map(ac => ({
        cardId: ac.cardId,
        cardValue: ac.Card?.cardValue ?? 0
      }));
    };

    socket.on("joinSession", async (sessionId, callback) => {
      try {
        console.log(`Attempting to join session ${sessionId}`);
        const session = await Session.findByPk(sessionId, {
          include: [
            {
              model: Group,
              include: [{
                model: GroupAcceptedCard,
                include: [Card]
              }]
            },
            {
              model: Deck,
              include: [Category]
            }
          ]
        });

        if (!session) {
          const error = new Error("Session not found");
          console.error(error);
          socket.emit("error", { message: error.message });
          if (callback) callback(error);
          return;
        }

        await socket.join(`session_${sessionId}`);
        console.log(`User ${socket.id} joined session ${sessionId}`);

        // Calculate total CO2 using cardValue
        const totalCO2 = session.Groups.reduce((sum, group) => {
          return sum + group.GroupAcceptedCards.reduce((groupSum, acceptedCard) => {
            return groupSum + (acceptedCard.Card?.cardValue ?? 0);
          }, 0);
        }, 0);

        // Get initial selected cards for each group
        const groupsWithCards = await Promise.all(
          session.Groups.map(async (group) => ({
            groupId: group.groupId,
            selectedCards: await getGroupAcceptedCards(group.groupId)
          }))
        );

        socket.emit("sessionState", {
          phase: session.phase,
          round: session.round,
          status: session.status,
          totalCO2,
          groups: groupsWithCards
        });

        if (callback) callback(null);
      } catch (error) {
        console.error("Join session error:", error);
        socket.emit("error", { message: "Failed to join session" });
        if (callback) callback(error);
      }
    });

    socket.on("changePhase", async ({ sessionId, newPhase }, callback) => {
      try {
        console.log(`Changing phase for session ${sessionId} to ${newPhase}`);
        const session = await Session.findByPk(sessionId, {
          include: [{
            model: Deck,
            include: [Category]
          }]
        });

        if (!session) {
          const error = new Error("Session not found");
          console.error(error);
          if (callback) callback(error);
          return;
        }

        if (newPhase < 0 || newPhase > 4) {
          const error = new Error("Invalid phase number");
          console.error(error);
          if (callback) callback(error);
          return;
        }

        await session.update({ phase: newPhase, round: 0 });
        
        io.to(`session_${sessionId}`).emit("phaseChanged", {
          phase: newPhase,
          round: 0,
          status: session.status
        });

        if (callback) callback(null, { success: true });
      } catch (error) {
        console.error("Phase change error:", error);
        if (callback) callback(error);
      }
    });

    socket.on("selectCard", async ({ sessionId, groupId, cardId }, callback) => {
      try {
        console.log(`Selecting card ${cardId} for group ${groupId} in session ${sessionId}`);
        const [session, group, card] = await Promise.all([
          Session.findByPk(sessionId),
          Group.findByPk(groupId),
          Card.findByPk(cardId)
        ]);

        if (!session || !group || !card) {
          const error = new Error("Session, group, or card not found");
          console.error(error);
          socket.emit("error", { message: error.message });
          if (callback) callback(error);
          return;
        }

        /*if (session.phase !== 1) {
          const error = new Error("Card selection only allowed in phase 1");
          console.error(error);
          socket.emit("error", { message: error.message });
          if (callback) callback(error);
          return;
        }*/

        let selected = false;
        const existingCard = await GroupAcceptedCard.findOne({
          where: { groupId, cardId }
        });

        if (existingCard) {
          await existingCard.destroy();
          selected = false;
        } else {
          await GroupAcceptedCard.create({ groupId, cardId });
          selected = true;
        }

        // Get updated selected cards for the group
        const selectedCards = await getGroupAcceptedCards(groupId);
        
        // Calculate new total CO2
        const totalCO2 = selectedCards.reduce((sum, card) => sum + card.cardValue, 0);

        // Emit the updated state to all clients in the session
        io.to(`session_${sessionId}`).emit("cardSelected", {
          groupId,
          cardId,
          selected,
          totalCO2,
          selectedCards
        });

        if (callback) callback(null, { 
          success: true,
          selected,
          totalCO2,
          selectedCards
        });
      } catch (error) {
        console.error("Card selection error:", error);
        if (callback) callback(error);
      }
    });

    socket.on("endPhase", async ({ sessionId }, callback) => {
      try {
        console.log(`Ending phase for session ${sessionId}`);
        const session = await Session.findByPk(sessionId, {
          include: [{
            model: Deck,
            include: [Category]
          }]
        });

        if (!session) {
          const error = new Error("Session not found");
          console.error(error);
          if (callback) callback(error);
          return;
        }

        let nextRound = session.round;
        let nextPhase = session.phase;

        if (session.round < session.Deck.Categories.length - 1) {
          nextRound = session.round + 1;
        } else {
          nextPhase = session.phase + 1;
          nextRound = 0;
        }

        await session.update({ 
          phase: nextPhase,
          round: nextRound
        });

        // Get updated selected cards for all groups
        const groups = await Group.findAll({
          where: { sessionId }
        });

        const groupsWithCards = await Promise.all(
          groups.map(async (group) => ({
            groupId: group.groupId,
            selectedCards: await getGroupAcceptedCards(group.groupId)
          }))
        );

        io.to(`session_${sessionId}`).emit("phaseChanged", {
          phase: nextPhase,
          round: nextRound,
          status: session.status,
          groups: groupsWithCards
        });

        if (callback) callback(null, { success: true });
      } catch (error) {
        console.error("End phase error:", error);
        if (callback) callback(error);
      }
    });

    socket.on("endSession", async ({ sessionId }, callback) => {
      try {
        console.log(`Ending session ${sessionId}`);
        const session = await Session.findByPk(sessionId);
        if (!session) {
          const error = new Error("Session not found");
          console.error(error);
          if (callback) callback(error);
          return;
        }

        await session.update({ 
          status: 'closed', 
          phase: 4,
          round: session.round
        });
        
        io.to(`session_${sessionId}`).emit("sessionEnded");

        if (callback) callback(null, { success: true });
      } catch (error) {
        console.error("End session error:", error);
        if (callback) callback(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from session socket");
    });
  });
};