import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set GEMINI_API_KEY in your Vercel Project Settings under Environment Variables.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return aiInstance;
}

// Helper for resilient Gemini API calls with retries and fallback model
async function generateContentWithRetry(params: {
  contents: any;
  config: any;
}) {
  const ai = getAI();
  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  const maxRetriesPerModel = 1;

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying Gemini request (model: ${model}, attempt: ${attempt + 1})...`);
          await new Promise((resolve) => setTimeout(resolve, 400));
        }

        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("Overloaded") ||
          errMsg.includes("FETCH_ERROR");

        const isModelUnavailable =
          errMsg.includes("no longer available") ||
          errMsg.includes("NOT_FOUND") ||
          errMsg.includes("404") ||
          errMsg.includes("not found") ||
          errMsg.includes("deprecated") ||
          errMsg.includes("invalid model");

        if (isModelUnavailable) {
          console.warn(`Model ${model} unavailable (${errMsg}), trying next fallback model...`);
          break; // Move to next model in modelsToTry
        }

        if (!isTransient) {
          throw err;
        }
        console.warn(`Gemini attempt ${attempt + 1} for ${model} encountered transient issue:`, errMsg);
      }
    }
  }

  // Parse clean error message if all retries fail
  let cleanErrorMessage = "The AI model is currently experiencing high demand. Please try again in a few moments.";
  if (lastError?.message) {
    try {
      const parsed = JSON.parse(lastError.message);
      if (parsed?.error?.message) {
        cleanErrorMessage = parsed.error.message;
      } else {
        cleanErrorMessage = lastError.message;
      }
    } catch {
      cleanErrorMessage = lastError.message;
    }
  }

  throw new Error(cleanErrorMessage);
}

// Health check GET handlers (do NOT handle GET / so SPA static files can be served)
app.get(["/api", "/api/health", "/health"], (req, res) => {
  res.json({
    status: "ok",
    message: "AI Pantry Chef API is operational",
    endpoints: ["POST /api/recipe", "POST /api/leftovers", "POST /api/storage-tips"]
  });
});

// Route handler logic
const handleRecipe = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "At least one ingredient is required to suggest recipes." });
    }

    const ingredientList = ingredients
      .map((ing: { name: string; quantity: number | string; unit: string }) => `- ${ing.name}: ${ing.quantity} ${ing.unit}`)
      .join("\n");

    const prompt = `Pantry ingredients:
${ingredientList}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful home cooking assistant. The user will give you a list of pantry ingredients with quantities. Based ONLY on what's available (plus common staples like salt, oil, water, pepper), suggest:\n1. Three meal ideas using these ingredients\n2. A step-by-step recipe for the best-fitting idea\n3. One creative way to use likely leftovers\nKeep instructions short, practical, and beginner-friendly. If key ingredients are missing for a normal dish, say so and suggest a substitution.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealIdeas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Name of the meal idea" },
                  description: { type: Type.STRING, description: "A brief, practical description of how it fits" }
                },
                required: ["title", "description"]
              },
              description: "Three meal ideas using the provided ingredients"
            },
            recipe: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Name of the best-fitting recipe" },
                substitutions: { type: Type.STRING, description: "If key ingredients are missing for a normal dish, specify them here along with suggested substitutions. If none, put 'None'." },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Step-by-step preparation steps, short and beginner-friendly"
                }
              },
              required: ["title", "substitutions", "steps"]
            },
            leftoversTip: {
              type: Type.STRING,
              description: "One creative way to use likely leftovers from this meal"
            }
          },
          required: ["mealIdeas", "recipe", "leftoversTip"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to generate response from Gemini API.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    next(error);
  }
};

const handleLeftovers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "At least one ingredient is required to suggest leftover ideas." });
    }

    const ingredientList = ingredients
      .map((ing: { name: string; quantity: number | string; unit: string }) => `- ${ing.name}: ${ing.quantity} ${ing.unit}`)
      .join("\n");

    const prompt = `Pantry ingredients:
${ingredientList}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        systemInstruction: "Given this pantry list, suggest 3 creative ways to combine likely leftovers into a new meal, assuming some items are already partially used or close to expiry. Be concise and practical.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Title of the leftover combination meal" },
                  description: { type: Type.STRING, description: "Short, practical steps or description of the meal" }
                },
                required: ["title", "description"]
              }
            }
          },
          required: ["ideas"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to generate response from Gemini API.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    next(error);
  }
};

const handleStorageTips = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "At least one ingredient is required to suggest storage tips." });
    }

    const ingredientList = ingredients
      .map((ing: { name: string; quantity: number | string; unit: string }) => `- ${ing.name}: ${ing.quantity} ${ing.unit}`)
      .join("\n");

    const prompt = `Pantry ingredients:
${ingredientList}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        systemInstruction: "For each ingredient in this list, give one short, practical food storage tip to make it last longer (fridge/freezer/pantry, and roughly how long it keeps). Format as a bullet list, one line per ingredient.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ingredient: { type: Type.STRING, description: "Name of the ingredient exactly as given" },
                  tip: { type: Type.STRING, description: "One short, practical food storage tip (fridge/freezer/pantry, and roughly how long it keeps)" }
                },
                required: ["ingredient", "tip"]
              }
            }
          },
          required: ["tips"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to generate response from Gemini API.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    next(error);
  }
};

// Route matching for POST requests
app.post(["/api/recipe", "/recipe"], handleRecipe);
app.post(["/api/leftovers", "/leftovers"], handleLeftovers);
app.post(["/api/storage-tips", "/storage-tips"], handleStorageTips);

// Universal fallback dispatcher for POST requests (handles Vercel serverless rewrite paths)
app.post("*", (req, res, next) => {
  const fullUrl = (req.originalUrl || req.url || "").toLowerCase();

  if (fullUrl.includes("recipe")) {
    return handleRecipe(req, res, next);
  }
  if (fullUrl.includes("leftover")) {
    return handleLeftovers(req, res, next);
  }
  if (fullUrl.includes("storage")) {
    return handleStorageTips(req, res, next);
  }

  next();
});

// Fallback JSON 404 handler ONLY for /api routes or unhandled POST requests
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.method === "POST") {
    return res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.url}` });
  }
  next();
});

// Global JSON error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("API error:", err);
  const message = err?.message || "Internal server error";
  res.status(500).json({ error: message });
});

export default app;
