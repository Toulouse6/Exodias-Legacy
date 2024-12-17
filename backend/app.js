import fs from "node:fs/promises";
import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import 'dotenv/config'; // Load environment variables

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

const dataPath = (file) => path.join(__dirname, "data", file);

// Middleware
app.use(express.static(path.join(__dirname, "images")));
app.use(bodyParser.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

// Backend Routes: 

// GET /exodia-parts
app.get("/exodia-parts", async (req, res) => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay
        const fileContent = await fs.readFile(dataPath("exodia-parts.json"));
        const cardsData = JSON.parse(fileContent);
        res.status(200).json({ cards: cardsData });
    } catch (error) {
        console.error("Error fetching exodia-parts:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET /user-cards
app.get("/user-cards", async (req, res) => {
    try {
        const fileContent = await fs.readFile(dataPath("user-cards.json"));
        const cards = JSON.parse(fileContent);
        res.status(200).json({ cards });
    } catch (error) {
        console.error("Error fetching user-cards:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// PUT /user-cards
app.put("/user-cards", async (req, res) => {
    try {
        const cardId = req.body.cardId;
        const fileContent = await fs.readFile(dataPath("exodia-parts.json"));
        const cardsData = JSON.parse(fileContent);
        const card = cardsData.find((card) => card.id === cardId);

        const userCardsFileContent = await fs.readFile(dataPath("user-cards.json"));
        const userCardsData = JSON.parse(userCardsFileContent);

        let updatedUserCards = userCardsData;

        if (!userCardsData.some((c) => c.id === card.id)) {
            updatedUserCards = [...userCardsData, card];
        }

        await fs.writeFile(dataPath("user-cards.json"), JSON.stringify(updatedUserCards));
        res.status(200).json({ userCards: updatedUserCards });
    } catch (error) {
        console.error("Error updating user-cards:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE /user-cards/:id
app.delete("/user-cards/:id", async (req, res) => {
    try {
        const cardId = req.params.id;
        const userCardsFileContent = await fs.readFile(dataPath("user-cards.json"));
        const userCardsData = JSON.parse(userCardsFileContent);

        const cardIndex = userCardsData.findIndex((card) => card.id === cardId);

        let updatedUserCards = userCardsData;

        if (cardIndex >= 0) {
            updatedUserCards.splice(cardIndex, 1);
        }

        await fs.writeFile(dataPath("user-cards.json"), JSON.stringify(updatedUserCards));
        res.status(200).json({ userCards: updatedUserCards });
    } catch (error) {
        console.error("Error deleting user-card:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST /reset-cards
app.post("/reset-cards", async (req, res) => {
    try {
        const fileContent = await fs.readFile(dataPath("exodia-parts.json"));
        const cardsData = JSON.parse(fileContent);

        await fs.writeFile(dataPath("user-cards.json"), JSON.stringify([]));
        res.status(200).json({ cards: cardsData });
    } catch (error) {
        console.error("Error resetting cards:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 404 Fallback
app.use((req, res) => {
    res.status(404).json({ message: "404 - Not Found" });
});

// Server Listener
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
