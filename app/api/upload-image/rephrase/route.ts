import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Add API version and key to the base URL
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Use gemini-pro model instead of gemini-1.5-pro as it's more widely available
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "API key is not configured" }, 
      { status: 500 }
    );
  }

  try {
    const { text } = await req.json();
    
    const prompt = `Please rephrase the following text, adding appropriate punctuation and correcting any grammatical errors while maintaining the original meaning and tone:

${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rephrasedText = response.text();

    return NextResponse.json({ rephrasedText });
  } catch (error: any) {
    console.error("Error in Gemini API call:", error);
    return NextResponse.json(
      { 
        error: "Failed to process text",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

