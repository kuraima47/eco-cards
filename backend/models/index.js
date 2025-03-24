const User = require('./User');
const Card = require('./Card');
const Category = require('./Category');
const Deck = require('./Deck');
const DeckContent = require('./DeckContent');
const Session = require('./Session');
const Group = require('./Group');
const GroupPlayer = require('./GroupPlayer');
const GroupAcceptedCard = require('./GroupAcceptedCard');


Card.belongsTo(Category, { foreignKey: 'cardCategoryId' });
Category.hasMany(Card, { foreignKey: 'cardCategoryId' });

Deck.hasMany(Category, { foreignKey: 'deckId' });
Category.belongsTo(Deck, { foreignKey: 'deckId' });

User.hasMany(Deck, { foreignKey: 'adminId' });
User.hasMany(Session, { foreignKey: 'adminId' });
User.hasMany(GroupPlayer, { foreignKey: 'userId' });

Deck.belongsTo(User, { foreignKey: 'adminId' });
Deck.hasMany(DeckContent, { foreignKey: 'deckId' });

Card.hasMany(DeckContent, { foreignKey: 'cardId' });
Card.hasMany(GroupAcceptedCard, { foreignKey: 'cardId' });

Session.belongsTo(User, { foreignKey: 'adminId' });
Session.hasMany(Group, { foreignKey: 'sessionId' });

Session.belongsTo(Deck, { foreignKey: 'deckId' });
Deck.hasMany(Session, { foreignKey: 'deckId' });

Group.belongsTo(Session, { foreignKey: 'sessionId' });
Group.hasMany(GroupPlayer, { foreignKey: 'groupId' });
Group.hasMany(GroupAcceptedCard, { foreignKey: 'groupId' });

GroupPlayer.belongsTo(Group, { foreignKey: 'groupId' });
GroupPlayer.belongsTo(User, { foreignKey: 'userId' });
Group.hasMany(GroupPlayer, { foreignKey: 'groupId' });
User.hasMany(GroupPlayer, { foreignKey: 'userId' });

GroupAcceptedCard.belongsTo(Group, { foreignKey: 'groupId' });
GroupAcceptedCard.belongsTo(Card, { foreignKey: 'cardId' });
Group.hasMany(GroupAcceptedCard, { foreignKey: 'groupId' });
Card.hasMany(GroupAcceptedCard, { foreignKey: 'cardId' });

module.exports = {
    User,
    Card,
    Category,
    Deck,
    DeckContent,
    Session,
    Group,
    GroupPlayer,
    GroupAcceptedCard,
};