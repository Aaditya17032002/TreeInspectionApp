import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function rephraseWithPunctuation(text: string): Promise<string> {
  const prompt = `Rephrase the following text, adding appropriate punctuation and correcting any grammatical errors:

${text}

Please maintain the original meaning and tone of the text.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    return text; // Return original text if there's an error
  }
}

