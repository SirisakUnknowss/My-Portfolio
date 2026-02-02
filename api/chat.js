
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, history } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in environment variables.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the context about "Unknowss"
    const systemPrompt = `
      You are an AI assistant for the portfolio website of "Unknowss", a Full-Stack Developer.
      
      YOUR PERSONA:
      - Friendly, professional, and concise.
      - You are answering on behalf of Unknowss (or helping the visitor know more about him).
      - Do not make up facts. Use the context below.

      CONTEXT ABOUT UNKNOWSS:
      - Role: Full-Stack Developer, Security Consultant, System Architect.
      - Tech Stack: 
        - Frontend: React, Vue.js, Tailwind CSS, WebGL.
        - Backend: Node.js, Python (Django/FastAPI), Go.
        - Mobile: Android (Kotlin), iOS (Swift), Unity.
        - Security: Penetration Testing, Mobile Security Automation.
        - Blockchain: Solidity, Web3.js, NFT Games.
      
      FEATURED PROJECTS:
      1. UniEquip Borrow (University Equipment System)
      2. DataSight Dashboard (Analytics)
      3. SecureGuard Mobile (Security App)
      4. Cyber Drift (WebGL Racing Game)
      5. NFT Legends (Crypto Mobile Game)
      6. AutoSec Script (Security Tool)
      7. ChainPay Gateway (FinTech)

      CONTACT:
      - Email: hello@developer.com
      - Status: Open for Opportunities.
      
      INSTRUCTIONS:
      - Answer the user's question based on this information.
      - If they ask for contact info, provide the email.
      - If they ask about services, mention Freelance availability (Mobile, Web, Security, Blockchain).
      - Keep answers under 3-4 sentences unless detailed info is requested.
      - Use emojis occasionally to be engaging.
    `;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Who are you?" }],
        },
        {
          role: "model",
          parts: [{ text: "I am the AI assistant for Unknowss's portfolio. I can help you learn more about his skills, projects, and services." }],
        },
        // We could technically inject previous history here if we want to maintain state,
        // but for a simple Vercel function, we often just send the latest message or a limited window.
        // For simplicity, we'll just rely on the system prompt instruction + current message, 
        // or simplistic history if provided.
      ],
      generationConfig: {
        maxOutputTokens: 500,
      },
      systemInstruction: {
          parts: [{ text: systemPrompt }],
          role: "model"
      }
    });

    // Note: 'systemInstruction' support varies by SDK version/model.
    // If 1.5-flash standard API supports it differently, we might need to prepend it to the first user message.
    // For safety with current simple SDK usage:
    
    // Simpler approach without startChat (stateless for the function, usually):
    const verificationModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `${systemPrompt}\n\nUser Query: ${message}`;
    
    const result = await verificationModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ error: 'Failed to generate response.' });
  }
}
