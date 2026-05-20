const express = require("express");
const router  = express.Router();
const fetch   = require("node-fetch");
const Chat    = require("../models/Chat");

// ── Emergency detector ──────────────────────────────────────
function isEmergency(msg) {
  const triggers = ["chest pain", "heart attack", "can't breathe", "fainting", "cardiac arrest"];
  return triggers.some((w) => msg.includes(w));
}

// ── Gemini AI (uses your existing HF_API_KEY which is actually a Google key) ──
async function callGemini(userMessage) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      system_instruction: {
        role: "system",
        parts: [
          {
            text: `
You are Heart-Shield AI, a professional and friendly cardiovascular health assistant.

Rules:
- Always give COMPLETE responses.
- Never stop sentence midway.
- Reply naturally in simple English.
- Keep answers short but meaningful.
- For serious symptoms suggest consulting a doctor.
- If user speaks Urdu/Roman Urdu, respond in simple Roman Urdu.
- Stay focused on medical and heart-health topics.
`
          }
        ]
      },

      contents: [
        {
          role: "user",
          parts: [
            {
              text: userMessage
            }
          ]
        }
      ],

      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.95,
        topK: 40
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log("Gemini Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return null;
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        ?.join(" ");

    return text?.trim() || null;

  } catch (err) {
    console.error("Gemini call failed:", err);
    return null;
  }
}

// ── Main chat route ─────────────────────────────────────────
router.post("/", async (req, res) => {
  const msg = req.body.message;
  if (!msg?.trim()) return res.json({ reply: "Please type a message." });

  const text = msg.toLowerCase().trim();

  // 🚨 Emergency check first
  if (isEmergency(text)) {
    const reply = "⚠️ This sounds like a medical emergency! Please call emergency services (115 in Pakistan) or go to the nearest hospital immediately. Do not wait.";
    await Chat.create({ userMessage: msg, botReply: reply }).catch(() => {});
    return res.json({ reply });
  }

  // 🤖 Gemini AI
  const aiReply = await callGemini(msg);

  if (aiReply) {
    await Chat.create({ userMessage: msg, botReply: aiReply }).catch(() => {});
    return res.json({ reply: aiReply });
  }

  // 📋 Final fallback (only if Gemini is completely unreachable)
  const fallback = "I'm having trouble connecting right now. Please try again in a moment, or ask about heart symptoms, prevention, or treatment.";
  await Chat.create({ userMessage: msg, botReply: fallback }).catch(() => {});
  return res.json({ reply: fallback });
});

module.exports = router;