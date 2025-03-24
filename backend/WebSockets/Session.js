const { Session, Group, GroupAcceptedCard, Card, Category, Deck } = require("../models");

module.exports = (io) => {
  io.of("/").on("connection", (socket) => {
    console.log("A user connected to the session");

    // Helper to retrieve accepted cards with updated fields
    const getGroupAcceptedCards = async (groupId) => {
      const acceptedCards = await GroupAcceptedCard.findAll({
        where: { groupId },
        include: [Card],
      });
      return acceptedCards.map((ac) => ({
        cardId: ac.cardId,
        cardValue: ac.Card?.cardValue ?? 0,
        co2Estimation: ac.co2estimation,
        acceptanceLevel: ac.acceptancelevel,
      }));
    };

    socket.on("joinSession", async (sessionId, callback) => {
      try {
        console.log(`Attempting to join session ${sessionId}`);
        const session = await Session.findByPk(sessionId, {
          include: [
            {
              model: Group,
              include: [
                {
                  model: GroupAcceptedCard,
                  include: [Card],
                },
              ],
            },
            {
              model: Deck,
              include: [Category],
            },
          ],
        });

        if (!session) {
          const error = new Error("Session not found");
          console.error(error);
          socket.emit("error", { message: error.message });
          if (callback) callback(error);
          return;
        }

        // Build initial CO₂ estimations and acceptance levels
        const allGroupAcceptedCards = await GroupAcceptedCard.findAll({
          where: {
            groupId: session.Groups.map((g) => g.groupId),
          },
        });
        const co2Estimations = {};
        const acceptanceLevels = {};
        allGroupAcceptedCards.forEach((ac) => {
          if (!co2Estimations[ac.groupId]) co2Estimations[ac.groupId] = {};
          if (!acceptanceLevels[ac.groupId]) acceptanceLevels[ac.groupId] = {};
          co2Estimations[ac.groupId][ac.cardId] = ac.co2estimation;
          acceptanceLevels[ac.groupId][ac.cardId] = ac.acceptancelevel;
        });

        await socket.join(`session_${sessionId}`);
        console.log(`User ${socket.id} joined session ${sessionId}`);

        // Calculate total CO₂ from accepted cards’ card values
        const totalCO2 = session.Groups.reduce((sum, group) => {
          return (
            sum +
            group.GroupAcceptedCards.reduce((groupSum, acceptedCard) => {
              return groupSum + (acceptedCard.Card?.cardValue ?? 0);
            }, 0)
          );
        }, 0);

        // Prepare the initial cards per group
        const groupsWithCards = await Promise.all(
          session.Groups.map(async (group) => ({
            groupId: group.groupId,
            selectedCards: await getGroupAcceptedCards(group.groupId),
          }))
        );

        socket.emit("sessionState", {
          phase: session.phase,
          round: session.round,
          status: session.status,
          totalCO2,
          groups: groupsWithCards,
          co2Estimations,
          acceptanceLevels,
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
          include: [
            {
              model: Deck,
              include: [Category],
            },
          ],
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
          status: session.status,
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
          Card.findByPk(cardId),
        ]);

        if (!session || !group || !card) {
          const error = new Error("Session, group, or card not found");
          console.error(error);
          socket.emit("error", { message: error.message });
          if (callback) callback(error);
          return;
        }

        let selected = false;
        const existingCard = await GroupAcceptedCard.findOne({
          where: { groupId, cardId },
        });

        if (existingCard) {
          await existingCard.destroy();
          selected = false;
        } else {
          await GroupAcceptedCard.create({ groupId, cardId });
          selected = true;
          // Increment the times_selected counter for the card
          await card.increment("times_selected");
        }

        // Retrieve updated selected cards for the group
        const selectedCards = await getGroupAcceptedCards(groupId);
        const totalCO2 = selectedCards.reduce((sum, card) => sum + card.cardValue, 0);

        io.to(`session_${sessionId}`).emit("cardSelected", {
          groupId,
          cardId,
          selected,
          totalCO2,
          selectedCards,
        });

        if (callback)
          callback(null, { success: true, selected, totalCO2, selectedCards });
      } catch (error) {
        console.error("Card selection error:", error);
        if (callback) callback(error);
      }
    });

    // CO₂ Estimation Handler
    socket.on("co2Estimation", async ({ sessionId, groupId, cardId, value }, callback) => {
      try {
        console.log(`Received co2Estimation for group:${groupId}, card:${cardId}, value:${value}`);
        const [record] = await GroupAcceptedCard.findOrCreate({
          where: { groupId, cardId },
          defaults: { groupId, cardId, co2estimation: value },
        });

        if (!record) {
          console.error("Failed to create CO₂ record");
          throw new Error("Failed to create CO₂ record");
        }

        // Update the CO₂ estimation (if the record already existed or after creation)
        await record.update({ co2estimation: value });
        console.log(`Updated CO₂ for group:${groupId}, card:${cardId} to ${value}`);

        // Emit updated CO₂ estimation to clients
        io.to(`session_${sessionId}`).emit("co2Estimation", { groupId, cardId, value });
        if (callback) callback(null, { success: true });
      } catch (error) {
        console.error("CO₂ save error:", error);
        if (callback) callback(error);
      }
    });

    // Acceptance Level Handler
    socket.on("acceptanceLevel", async ({ sessionId, groupId, cardId, level }, callback) => {
      try {
        console.log(`Saving acceptanceLevel for group:${groupId}, card:${cardId}, level:${level}`);
        const [record] = await GroupAcceptedCard.findOrCreate({
          where: { groupId, cardId },
          defaults: { groupId, cardId, acceptancelevel: level },
        });

        if (!record) {
          console.error("Failed to create acceptance level record");
          throw new Error("Failed to create acceptance level record");
        }

        await record.update({ acceptancelevel: level });
        console.log(`Updated acceptance level for group:${groupId}, card:${cardId} to ${level}`);

        // Emit updated acceptance level to clients
        io.to(`session_${sessionId}`).emit("acceptanceLevel", { groupId, cardId, level });
        if (callback) callback(null, { success: true });
      } catch (error) {
        console.error("Acceptance level save error:", error);
        if (callback) callback(error);
      }
    });

    socket.on("endPhase", async ({ sessionId }, callback) => {
      try {
        console.log(`Ending phase for session ${sessionId}`);
        const session = await Session.findByPk(sessionId, {
          include: [
            {
              model: Deck,
              include: [Category],
            },
          ],
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

        await session.update({ phase: nextPhase, round: nextRound });
        const groups = await Group.findAll({ where: { sessionId } });
        const groupsWithCards = await Promise.all(
          groups.map(async (group) => ({
            groupId: group.groupId,
            selectedCards: await getGroupAcceptedCards(group.groupId),
          }))
        );

        io.to(`session_${sessionId}`).emit("phaseChanged", {
          phase: nextPhase,
          round: nextRound,
          status: session.status,
          groups: groupsWithCards,
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

        await session.update({ status: "closed", phase: 4, endedAt: new Date() });
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
