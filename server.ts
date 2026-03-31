import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes FIRST
  app.post("/api/submit-survey", async (req, res) => {
    try {
      const data = req.body;
      const MONDAY_API_KEY = process.env.MONDAY_API_KEY;
      const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID;

      if (!MONDAY_API_KEY || !MONDAY_BOARD_ID) {
        console.warn("Monday.com credentials not configured. Simulating success.");
        // Simulate success if not configured, for demo purposes
        return res.json({ success: true, message: "Simulated success (no credentials)" });
      }

      // Prepare Monday.com GraphQL mutation
      // We'll create an item and populate the specific columns.
      const itemName = `Umfrage: ${new Date().toLocaleDateString("de-DE")}`;
      
      // Helper to format arrays with "Sonstiges"
      const formatArray = (arr: string[], other: string) => {
        let result = arr.join(", ");
        if (other) {
          result += result ? `, Sonstiges: ${other}` : `Sonstiges: ${other}`;
        }
        return result;
      };

      // Construct the column values JSON string using the exact column IDs provided
      const columnValues = JSON.stringify({
        "text_mm1cagge": data.learning || "", // Frage 1
        "text_mm1atkge": formatArray(data.investmentGoals, data.investmentGoalsOther), // Frage 2
        "text_mm1a1xn4": formatArray(data.interestingTopics, data.interestingTopicsOther), // Frage 3
        "text_mm1az4g3": data.securityLevel || "", // Frage 4
        "text_mm1ar4mx": formatArray(data.hurdles, data.hurdlesOther), // Frage 5
        "text_mm1at1wv": data.feelMoreSecure || "" // Frage 6
      });
      
      const createItemQuery = `
        mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
          create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
            id
          }
        }
      `;

      const createItemResponse = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": MONDAY_API_KEY,
          "API-Version": "2024-01"
        },
        body: JSON.stringify({
          query: createItemQuery,
          variables: {
            boardId: MONDAY_BOARD_ID,
            itemName: itemName,
            columnValues: columnValues
          }
        })
      });

      const createItemResult = await createItemResponse.json();

      if (createItemResult.errors) {
        console.error("Monday.com create item error:", createItemResult.errors);
        return res.status(500).json({ success: false, error: "Failed to create item in Monday.com" });
      }

      const itemId = createItemResult.data.create_item.id;

      // Format the survey data as a readable text block for the update
      const updateBody = `
        <h2>Neue Umfrage-Ergebnisse</h2>
        <br/>
        <strong>1. Größtes Learning & Verbesserungsvorschläge:</strong><br/>
        ${data.learning || "-"}
        <br/><br/>
        <strong>2. Wichtig beim Investmentaufbau:</strong><br/>
        ${data.investmentGoals?.join(", ") || "-"}
        ${data.investmentGoalsOther ? `(Sonstiges: ${data.investmentGoalsOther})` : ""}
        <br/><br/>
        <strong>3. Interessante Themen:</strong><br/>
        ${data.interestingTopics?.join(", ") || "-"}
        ${data.interestingTopicsOther ? `(Sonstiges: ${data.interestingTopicsOther})` : ""}
        <br/><br/>
        <strong>4. Sicherheit im Umgang mit Investments:</strong><br/>
        ${data.securityLevel || "-"}
        <br/><br/>
        <strong>5. Hinderungsgründe für den Start:</strong><br/>
        ${data.hurdles?.join(", ") || "-"}
        ${data.hurdlesOther ? `(Sonstiges: ${data.hurdlesOther})` : ""}
        <br/><br/>
        <strong>6. Sicherer nach dem Workshop?</strong><br/>
        ${data.feelMoreSecure || "-"}
      `;

      const createUpdateQuery = `
        mutation ($itemId: ID!, $body: String!) {
          create_update (item_id: $itemId, body: $body) {
            id
          }
        }
      `;

      const createUpdateResponse = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": MONDAY_API_KEY,
          "API-Version": "2024-01"
        },
        body: JSON.stringify({
          query: createUpdateQuery,
          variables: {
            itemId: itemId,
            body: updateBody
          }
        })
      });

      const createUpdateResult = await createUpdateResponse.json();

      if (createUpdateResult.errors) {
        console.error("Monday.com create update error:", createUpdateResult.errors);
        return res.status(500).json({ success: false, error: "Failed to add details to Monday.com item" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
