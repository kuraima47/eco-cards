require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser');
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const corsOptions = require("./config/corsConfig");
const sequelize = require("./config/db");

const userRoutes = require("./routes/UserRoutes");
const cardRoutes = require("./routes/CardRoutes");
const deckRoutes = require("./routes/DeckRoutes");
const deckContentRoutes = require("./routes/DeckContentRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");
const sessionRoutes = require("./routes/SessionRoutes");
const groupRoutes = require("./routes/GroupRoutes");
const groupPlayerRoutes = require("./routes/GroupPlayerRoutes");
const groupAcceptedCardRoutes = require("./routes/GroupAcceptedCardRoutes");
const authRoutes = require("./routes/AuthRoutes");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./docs/openapi.yaml");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

const PORT = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(bodyParser.urlencoded({
  parameterLimit: 100000,
  limit: '50mb',
  extended: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/decks", deckRoutes);
app.use("/api/deck-contents", deckContentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/group-players", groupPlayerRoutes);
app.use("/api/group-accepted-cards", groupAcceptedCardRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

require("./WebSockets/Session")(io);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    await sequelize.sync({ force: false });
    console.log("✅ Database synchronized successfully.");

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start the application:", error);
    process.exit(1);
  }
};

start();
