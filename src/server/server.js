import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// API KEY
// =========================

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
} else {
  console.log("✅ Gemini API key loaded");
}


// =========================
// GEMINI
// =========================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
  res.send("Gemini backend is running!");
});


// =========================
// CHAT
// =========================

app.post("/api/chat", async (req, res) => {

  try {

    const { message } = req.body;

    console.log("\n==============================");
    console.log("User message:", message);
    console.log("==============================");


    // Check message
    if (!message || !message.trim()) {

      return res.status(400).json({
        error: "Message is required"
      });

    }


    // Models will be tried in this order
    const models = [
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash"
    ];


    let response = null;


    // ==========================================
    // TRY EACH MODEL
    // ==========================================

    for (const model of models) {

      console.log(`\n🤖 Trying model: ${model}`);


      // Retry each model 2 times
      for (let attempt = 1; attempt <= 2; attempt++) {

        try {

          console.log(
            `Attempt ${attempt}/2`
          );


          response = await ai.models.generateContent({

            model: model,

            contents: message

          });


          console.log(
            `✅ SUCCESS using ${model}`
          );


          break;

        } catch (error) {

          console.log(
            `❌ ${model} failed`
          );


          const status =
            error?.status ||
            error?.error?.status;


          const code =
            error?.code ||
            error?.error?.code;


          console.log(
            "Status:",
            status
          );


          console.log(
            "Code:",
            code
          );


          // ----------------------------------
          // Temporary error
          // ----------------------------------

          const temporaryError =
            status === "UNAVAILABLE" ||
            status === "RESOURCE_EXHAUSTED" ||
            code === 503 ||
            code === 429;


          // If it is NOT a temporary error,
          // don't keep trying the same model.

          if (!temporaryError) {

            console.log(
              "⚠️ Non-temporary Gemini error"
            );

            break;

          }


          // Last attempt for this model
          if (attempt === 2) {

            console.log(
              `⚠️ ${model} unavailable`
            );

            break;

          }


          // Wait before retry
          const delay = 2000 * attempt;


          console.log(
            `⏳ Waiting ${delay}ms...`
          );


          await new Promise(
            resolve => setTimeout(resolve, delay)
          );

        }

      }


      // ----------------------------------
      // If successful, stop trying models
      // ----------------------------------

      if (response) {

        break;

      }

    }


    // ==========================================
    // ALL MODELS FAILED
    // ==========================================

    if (!response) {

      console.log(
        "\n❌ All Gemini models are currently unavailable."
      );


      return res.status(503).json({

        error:
          "Gemini is temporarily unavailable. Please try again in a few seconds."

      });

    }


    // ==========================================
    // SEND RESPONSE
    // ==========================================

    return res.status(200).json({

      reply: response.text

    });


  } catch (error) {

    console.error(
      "\n❌ SERVER ERROR:"
    );

    console.error(error);


    return res.status(500).json({

      error:
        "Something went wrong. Please try again."

    });

  }

});


// =========================
// START SERVER
// =========================

const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );

});