-- Création du type énuméré pour le rôle utilisateur
CREATE TYPE user_role AS ENUM ('admin', 'player');

--------------------------------------------
-- Création des tables principales
--------------------------------------------

-- Table Users
CREATE TABLE Users (
    userId SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'player'
);

-- Table Decks
CREATE TABLE Decks (
    deckId SERIAL PRIMARY KEY,
    deckName VARCHAR(255) NOT NULL,
    adminId INT NOT NULL,
    FOREIGN KEY (adminId) REFERENCES Users(userId) ON DELETE CASCADE
);

-- Table Categories (ajout de deckId conformément au modèle Sequelize)
CREATE TABLE Categories (
    categoryId SERIAL PRIMARY KEY,
    categoryName VARCHAR(255) NOT NULL,
    categoryDescription TEXT,
    categoryColor VARCHAR(7) CHECK (categoryColor IS NULL OR categoryColor = '' OR categoryColor ~ '^#[0-9A-Fa-f]{6}$'),
    categoryIcon VARCHAR(255),
    deckId INT,
    FOREIGN KEY (deckId) REFERENCES Decks(deckId) ON DELETE SET NULL
);

-- Table Cards
CREATE TABLE Cards (
    cardId SERIAL PRIMARY KEY,
    cardName VARCHAR(255),
    cardDescription TEXT,
    cardActual TEXT,
    cardProposition TEXT,
    cardImageData BYTEA,
    cardCategoryId INT,
    cardValue INT,
    times_selected INT DEFAULT 0,
    qrCodeColor VARCHAR(7) CHECK (qrCodeColor IS NULL OR qrCodeColor = '' OR qrCodeColor ~ '^#[0-9A-Fa-f]{6}$'),
    qrCodeLogoImageData BYTEA,
    backgroundColor VARCHAR(7) CHECK (qrCodeColor IS NULL OR qrCodeColor = '' OR qrCodeColor ~ '^#[0-9A-Fa-f]{6}$'),
    FOREIGN KEY (cardCategoryId) REFERENCES Categories(categoryId) ON DELETE CASCADE
);

-- Table DeckContents
CREATE TABLE DeckContents (
    deckId INT NOT NULL,
    cardId INT NOT NULL,
    PRIMARY KEY (deckId, cardId),
    FOREIGN KEY (deckId) REFERENCES Decks(deckId) ON DELETE CASCADE,
    FOREIGN KEY (cardId) REFERENCES Cards(cardId) ON DELETE CASCADE
);

-- Table Sessions
CREATE TABLE Sessions (
    sessionId SERIAL PRIMARY KEY,
    adminId INT NOT NULL,
    sessionName VARCHAR(255) NOT NULL,
    deckId INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed')),
    phase INT NOT NULL DEFAULT 0 CHECK (phase >= 0 AND phase <= 4),
    round INT NOT NULL DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endedAt TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES Users(userId) ON DELETE CASCADE,
    FOREIGN KEY (deckId) REFERENCES Decks(deckId) ON DELETE CASCADE
);


-- Table Groups
CREATE TABLE Groups (
    groupId SERIAL PRIMARY KEY,
    sessionId INT NOT NULL,
    groupName VARCHAR(255) NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES Sessions(sessionId) ON DELETE CASCADE
);

-- Table GroupPlayers
CREATE TABLE GroupPlayers (
    groupId INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    userId INT,
    PRIMARY KEY (groupId, username),
    FOREIGN KEY (groupId) REFERENCES Groups(groupId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE SET NULL,
    UNIQUE (groupId, username)
);

-- Table GroupAcceptedCards
CREATE TABLE GroupAcceptedCards (
    groupId INT NOT NULL,
    cardId INT NOT NULL,
    co2estimation INT NULL,
    acceptancelevel VARCHAR(10) NULL CHECK (acceptancelevel IN ('high', 'medium', 'low') OR acceptancelevel IS NULL),
    PRIMARY KEY (groupId, cardId),
    FOREIGN KEY (groupId) REFERENCES Groups(groupId) ON DELETE CASCADE,
    FOREIGN KEY (cardId) REFERENCES Cards(cardId) ON DELETE CASCADE
);

--------------------------------------------
-- Insertion des données de test
--------------------------------------------

-- 1. Insertion des utilisateurs
INSERT INTO Users (username, email, user_password, role) VALUES
  ('admin', 'admin@ecocards.com', '$2b$10$91WV/DUU6oWaOcAxF47RUuLykgcLSXs5jywsiCH0xyJi7Szi0GVsC', 'admin'),
  ('player1', 'player1@example.com', 'password123', 'player'),
  ('player2', 'player2@example.com', 'password123', 'player'),
  ('player3', 'player3@example.com', 'password123', 'player'),
  ('player4', 'player4@example.com', 'password123', 'player'),
  ('player5', 'player5@example.com', 'password123', 'player'),
  ('teacher1', 'teacher1@school.edu', 'teacher123', 'admin'),
  ('teacher2', 'teacher2@school.edu', 'teacher123', 'admin');

-- 2. Insertion des decks
INSERT INTO Decks (deckName, adminId) VALUES
  ('Climate Basics', 1),
  ('Marine Conservation', 1),
  ('Sustainable Living', 7),
  ('Biodiversity Crisis', 6);

-- 3. Insertion des catégories
INSERT INTO Categories (categoryName, categoryColor, categoryIcon, deckId) VALUES
  ('Climate', '#3498db', 'cloud-sun', 1),
  ('Pollution', '#e74c3c', 'radiation', 1),
  ('Energy', '#f39c12', 'bolt', 1),
  ('Biodiversity', '#2ecc71', 'leaf', 2),
  ('Resources', '#9b59b6', 'zap', 2),
  ('Food', '#27ae60', 'utensils', 3),
  ('Oceans', '#3498db', 'waves', 3),
  ('Transportation', '#95a5a6', 'car', 4),
  ('Consumption', '#e67e22', 'shopping-cart', 4);

-- 4. Insertion des cartes
-- Remarque : les valeurs décimales de cardValue ont été converties en entiers (arrondis)
INSERT INTO Cards (cardName, cardActual, cardProposition, cardImageData, cardCategoryId, cardValue, times_selected, qrCodeColor, qrCodeLogoImageData, backgroundColor) VALUES
  ('Carbon Footprint', 'The average American produces 16 tons of CO2 per year.', 'Americans produce more CO2 per capita than any other country.', NULL, 1, 11, 3, '#000000', NULL, '#FFFFFF'),
  ('Plastic Waste', 'About 8 million tons of plastic enter the oceans every year.', 'Plastic waste in oceans will outweigh fish by 2050.', NULL, 2, 9, 5, '#000000', NULL, '#FFFFFF'),
  ('Renewable Energy', 'Solar energy is now the cheapest form of electricity in most countries.', 'Solar energy accounts for more than 50% of global energy production.', NULL, 3, 12, 2, '#000000', NULL, '#FFFFFF'),
  ('Deforestation', 'The Earth loses about 10 million hectares of forest every year.', 'The Amazon rainforest produces 20% of the world''s oxygen.', NULL, 4, 9, 4, '#000000', NULL, '#FFFFFF'),
  ('Water Scarcity', '2 billion people worldwide don''t have access to clean drinking water.', 'Less than 1% of Earth''s water is available for human consumption.', NULL, 5, 11, 1, '#000000', NULL, '#FFFFFF'),
  ('Meat Consumption', 'Livestock production accounts for 14.5% of global greenhouse gas emissions.', 'A vegetarian diet reduces your carbon footprint by 50%.', NULL, 6, 8, 6, '#000000', NULL, '#FFFFFF'),
  ('Ocean Acidification', 'The ocean has become 30% more acidic since the industrial revolution.', 'All coral reefs will disappear by 2050 due to ocean acidification.', NULL, 7, 11, 2, '#000000', NULL, '#FFFFFF'),
  ('Electric Vehicles', 'EVs produce fewer emissions than gas cars, even when powered by coal electricity.', 'Electric vehicles produce zero emissions throughout their lifecycle.', NULL, 8, 10, 3, '#000000', NULL, '#FFFFFF'),
  ('Fast Fashion', 'The fashion industry produces 10% of global carbon emissions.', 'The average garment is worn only 7 times before being discarded.', NULL, 9, 8, 5, '#000000', NULL, '#FFFFFF'),
  ('Bee Decline', 'Global bee populations have declined by 30% in the last decade.', 'Without bees, humans would only survive for 4 years.', NULL, 4, 10, 4, '#000000', NULL, '#FFFFFF');

-- 5. Insertion des DeckContents
INSERT INTO DeckContents (deckId, cardId) VALUES
  -- Climate Basics deck
  (1, 1), (1, 3), (1, 8),
  -- Marine Conservation deck
  (2, 2), (2, 7), (2, 5),
  -- Sustainable Living deck
  (3, 6), (3, 9), (3, 3), (3, 8),
  -- Biodiversity Crisis deck
  (4, 4), (4, 10), (4, 7);

-- 6. Insertion des Sessions
INSERT INTO Sessions (adminId, sessionName, deckId, createdAt) VALUES
  (1, 'Earth Day Workshop', 1, '2025-01-15 09:30:00'),
  (7, 'High School Environmental Club', 3, '2025-02-01 14:45:00'),
  (6, 'Science Class Activity', 4, '2025-02-10 10:15:00'),
  (1, 'Community Outreach', 2, '2025-02-20 16:00:00');

-- 7. Insertion des Groups
INSERT INTO Groups (sessionId, groupName) VALUES
  (1, 'Team Dolphins'),
  (1, 'Team Tigers'),
  (2, 'Freshmen'),
  (2, 'Sophomores'),
  (3, 'Group A'),
  (3, 'Group B'),
  (3, 'Group C'),
  (4, 'Neighborhood 1'),
  (4, 'Neighborhood 2');

-- 8. Insertion des GroupPlayers
INSERT INTO GroupPlayers (groupId, username, userId) VALUES
  (1, 'player1', 2),
  (1, 'player2', 3),
  (2, 'player3', 4),
  (2, 'player4', 5),
  (3, 'player1', 2),
  (3, 'guest1', NULL),
  (4, 'player5', 6),
  (4, 'guest2', NULL),
  (5, 'student1', NULL),
  (5, 'student2', NULL),
  (6, 'student3', NULL),
  (6, 'student4', NULL),
  (7, 'student5', NULL),
  (7, 'student6', NULL),
  (8, 'community1', NULL),
  (8, 'community2', NULL),
  (9, 'community3', NULL),
  (9, 'community4', NULL);

-- 9. Insertion des GroupAcceptedCards
INSERT INTO GroupAcceptedCards (groupId, cardId) VALUES
  -- Team Dolphins accepted cards
  (1, 1), (1, 3),
  -- Team Tigers accepted cards  
  (2, 1), (2, 8),
  -- Freshmen accepted cards
  (3, 6), (3, 9),
  -- Sophomores accepted cards
  (4, 3), (4, 8),
  -- Group A accepted cards
  (5, 4), (5, 10),
  -- Group B accepted cards
  (6, 10), (6, 7),
  -- Group C accepted cards
  (7, 4), (7, 10),
  -- Neighborhood 1 accepted cards
  (8, 2), (8, 7),
  -- Neighborhood 2 accepted cards
  (9, 2), (9, 5);

-- 10. Mise à jour du champ times_selected dans la table Cards
UPDATE Cards SET times_selected = (
  SELECT COUNT(*) FROM GroupAcceptedCards WHERE GroupAcceptedCards.cardId = Cards.cardId
);

--- Test deck for sessions

-- Ajout d'un test deck avec règles complètes
INSERT INTO Decks (deckName, adminId) VALUES
  ('Éco-Transitions Training Deck', 1);


INSERT INTO Categories (categoryName, categoryColor, categoryIcon, deckId) VALUES
('Climate', '#3498db', 'cloud-sun', 5),
('Food', '#27ae60', 'apple-alt', 5),
('Transportation', '#95a5a6', 'car', 5),
('Energy', '#f39c12', 'bolt', 5);


-- Insertion des cartes du test deck (cardImage sera NULL par défaut si non fourni)
INSERT INTO Cards (cardName, cardActual, cardProposition, cardCategoryId, cardValue, qrCodeColor, qrCodeLogoImageData, backgroundColor ) VALUES
  ('Building Insulation', 'Current insulation saves 10% energy', 'Upgrade insulation to save 25% energy', 10, 15, '#000000', NULL, '#FFFFFF'),
  ('Paperless Office', '30% documents printed', 'Reduce printing by 80%', 11, 12, '#000000', NULL, '#FFFFFF'),
  ('Carpool Incentives', '5% carpool usage', 'Implement carpool program to reach 30%', 12, 18, '#000000', NULL, '#FFFFFF'),
  ('Local Food Sourcing', '20% food locally sourced', 'Increase to 60% local ingredients', 11, 14, '#000000', NULL, '#FFFFFF'),
  ('Solar Panel Installation', '5% solar energy usage', 'Install panels to cover 40% needs', 13, 22, '#000000', NULL, '#FFFFFF'),
  ('Waste Recycling', '30% waste recycled', 'Achieve 70% recycling rate', 10, 16, '#000000', NULL, '#FFFFFF'),
  ('Green Transportation', '10% of trips by public transport', 'Increase to 50% by 2025', 12, 20, '#000000', NULL, '#FFFFFF'),
  ('Energy Efficient Appliances', '20% of homes use efficient appliances', 'Increase to 80% by 2030', 10, 17, '#000000', NULL, '#FFFFFF'),
  ('Composting Initiatives', '15% of waste composted', 'Achieve 50% composting rate', 10, 19, '#000000', NULL, '#FFFFFF'),
  ('Sustainable Packaging', '25% of products use sustainable packaging', 'Increase to 75% by 2025', 11, 15, '#000000', NULL, '#FFFFFF'),
  ('Community Gardens', '5% of neighborhoods have gardens', 'Increase to 30% by 2025', 11, 18, '#000000', NULL, '#FFFFFF'),
  ('Water Conservation', '10% reduction in water usage', 'Achieve 30% reduction by 2025', 10, 16, '#000000', NULL, '#FFFFFF'),
  ('Urban Green Spaces', '5% of urban areas are green spaces', 'Increase to 20% by 2030', 13, 20, '#000000', NULL, '#FFFFFF'),
  ('Bicycle Infrastructure', '5% of trips by bike', 'Increase to 15% by 2025', 12, 18, '#000000', NULL, '#FFFFFF'),
  ('Renewable Energy Sources', '20% energy from renewables', 'Increase to 50% by 2030', 13, 22, '#000000', NULL, '#FFFFFF'),
  ('Sustainable Forestry', '10% of timber from sustainable sources', 'Increase to 50% by 2025', 10, 19, '#000000', NULL, '#FFFFFF'),
  ('Green Building Standards', '10% of buildings meet green standards', 'Increase to 40% by 2030', 10, 21, '#000000', NULL, '#FFFFFF'),
  ('Waste Reduction Programs', '20% reduction in landfill waste', 'Achieve 50% reduction by 2025', 10, 16, '#000000', NULL, '#FFFFFF'),
  ('Pollution Control Measures', '30% reduction in air pollution', 'Achieve 70% reduction by 2030', 10, 20, '#000000', NULL, '#FFFFFF'),
  ('Environmental Education', '20% of schools have environmental programs', 'Increase to 60% by 2025', 11, 17, '#000000', NULL, '#FFFFFF');


INSERT INTO DeckContents (deckId, cardId) VALUES
  (5, 11), (5, 12), (5, 13), (5, 14), (5, 15), (5, 16),
  (5, 17), (5, 18), (5, 19), (5, 20), (5, 21), (5, 22),
  (5, 23), (5, 24), (5, 25), (5, 26), (5, 27), (5, 28),
  (5, 29), (5, 30);

-- Création d'une session test pour le deck
INSERT INTO Sessions (adminId, sessionName, deckId, createdAt) VALUES
  (1, 'Éco-Transitions Workshop', 5, CURRENT_DATE);

-- Création de groupes avec noms explicites pour la session test
INSERT INTO Groups (sessionId, groupName) VALUES
  ((SELECT sessionId FROM Sessions WHERE sessionName = 'Éco-Transitions Workshop'), 'Building Team'),
  ((SELECT sessionId FROM Sessions WHERE sessionName = 'Éco-Transitions Workshop'), 'Transportation Team'),
  ((SELECT sessionId FROM Sessions WHERE sessionName = 'Éco-Transitions Workshop'), 'Food Services Team');

-- Ajout de joueurs aux groupes
INSERT INTO GroupPlayers (groupId, username, userId) VALUES
  (10, 'teacher1', 7),
  (10, 'player1', 2),
  (11, 'teacher2', 6),
  (11, 'player3', 4),
  (12, 'admin', 1),
  (12, 'player5', 5);

-- Ajout des cartes acceptées pour la phase 1
INSERT INTO GroupAcceptedCards (groupId, cardId) VALUES
  (10, 11), (10, 15),  -- Building Team
  (11, 13), (11, 16),  -- Transportation Team
  (12, 12), (12, 14);  -- Food Services Team
