import fs from "node:fs/promises";
import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(express.static("images"));
app.use(bodyParser.json());

// CORS

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    next();
});


// Backend Routes: 

//GET
app.get("/exodia-parts", async (req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const fileContent = await fs.readFile("./data/exodia-parts.json");

    const cardsData = JSON.parse(fileContent);

    res.status(200).json({ cards: cardsData });
});

app.get("/user-cards", async (req, res) => {
    const fileContent = await fs.readFile("./data/user-cards.json");

    const cards = JSON.parse(fileContent);

    res.status(200).json({ cards });
});

//  PUT
app.put("/user-cards", async (req, res) => {
    const cardId = req.body.cardId;

    // return res.status(500).json();


    const fileContent = await fs.readFile("./data/exodia-parts.json");
    const cardsData = JSON.parse(fileContent);

    const card = cardsData.find((card) => card.id === cardId);

    const userCardsFileContent = await fs.readFile("./data/user-cards.json");
    const userCardsData = JSON.parse(userCardsFileContent);

    let updatedUserCards = userCardsData;

    if (!userCardsData.some((c) => c.id === card.id)) {
        updatedUserCards = [...userCardsData, card];
    }

    await fs.writeFile(
        "./data/user-cards.json",
        JSON.stringify(updatedUserCards)
    );

    res.status(200).json({ userCards: updatedUserCards });
});


// DELETE
app.delete("/user-cards/:id", async (req, res) => {
    const cardId = req.params.id;

    const userCardsFileContent = await fs.readFile("./data/user-cards.json");
    const userCardsData = JSON.parse(userCardsFileContent);

    const cardIndex = userCardsData.findIndex((card) => card.id === cardId);

    let updatedUserCards = userCardsData;

    if (cardIndex >= 0) {
        updatedUserCards.splice(cardIndex, 1);
    }

    await fs.writeFile(
        "./data/user-cards.json",
        JSON.stringify(updatedUserCards)
    );

    res.status(200).json({ userCards: updatedUserCards });
});

// Post (Reset Cards)
app.post("/reset-cards", async (req, res) => {

    // Set original exodia-parts.json
    const fileContent = await fs.readFile("./data/exodia-parts.json");
    const cardsData = JSON.parse(fileContent);

    // Clear user-cards.json
    await fs.writeFile("./data/user-cards.json", JSON.stringify([]));

    res.status(200).json({ cards: cardsData });
});


// 404
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    res.status(404).json({ message: "404 - Not Found" });
});

app.listen(3000);
