import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the prompt
    const prompt = `Analyze this trading chart. Act as an expert crypto/stock trader.
    Return ONLY a JSON object with the following structure, and no other markdown or text:
    {
      "trend": "Bullish" | "Bearish" | "Neutral",
      "signal": "Entry" | "Hold" | "Exit",
      "riskLevel": "Low" | "Medium" | "High",
      "volume": "Low" | "Medium" | "High",
      "supportLevel": "$XX,XXX",
      "resistanceLevel": "$XX,XXX",
      "overview": "A brief 1-2 sentence overview of the market conditions."
    }`;

    // Convert base64 to generative part
    // Assumes base64 string doesn't have the data:image/jpeg;base64, prefix or strips it
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    // Parse JSON
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
