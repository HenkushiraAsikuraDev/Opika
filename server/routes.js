import express from "express";
import { openai } from "./openaiClient.js";
import { OPIKA_SYSTEM_PROMPT } from "./opikaPrompt.js";
import { getMemory, addMemory, clearMemory } from "./memoryStore.js";

export const router = express.Router();

function buildModeInstruction(mode) {
  switch (mode) {
    case "tutor":
      return `You are in Tutor mode. Teach step-by-step with examples and mini exercises.`;
    case "grammar":
      return `You are in Grammar mode. Explain grammar clearly, include Vietnamese explanation and English examples.`;
    case "vocab":
      return `You are in Vocabulary mode. Provide 7 words, meanings, pronunciation tips, and example sentences.`;
    case "quiz":
      return `You are in Quiz mode. Ask 5 English questions and wait for user's answers.`;
    case "conversation":
      return `You are in Conversation mode. Chat in English, ask questions, correct gently.`;
    default:
      return `You are in Normal mode. Answer normally but keep English learning twist.`;
  }
}

router.post("/chat", async (req, res) => {
  try {
    const { sessionId, message, mode } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "Missing sessionId or message" });
    }

    const memory = getMemory(sessionId);

    const messages = [
      { role: "system", content: OPIKA_SYSTEM_PROMPT },
      { role: "system", content: buildModeInstruction(mode) },
      ...memory,
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || "gpt-4o-mini",
      messages,
      temperature: 0.8
    });

    const reply = response.choices[0].message.content;

    addMemory(sessionId, "user", message);
    addMemory(sessionId, "assistant", reply);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/reset", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

  clearMemory(sessionId);
  res.json({ ok: true });
});
