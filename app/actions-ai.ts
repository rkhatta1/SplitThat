"use server";

import { GoogleGenAI } from "@google/genai";
import * as mupdf from "mupdf";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const doc = mupdf.Document.openDocument(buffer, "application/pdf");
  let text = "";

  for (let i = 0; i < doc.countPages(); i++) {
    const page = doc.loadPage(i);
    text += page.toStructuredText().asText() + "\n";
  }

  return text;
}

export async function processReceipt(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());

  let content: string;

  if (file.type === "application/pdf") {
    // Extract text from PDF using mupdf
    const pdfText = await extractTextFromPDF(buffer);
    content = pdfText;
  } else {
    // For images, convert to base64
    content = buffer.toString("base64");
  }

  const prompt = `
    You are an expert receipt parser. Extract the items, their prices, and the total amount from this receipt.
    Return ONLY a JSON object in the following format:
    {
      "total": number,
      "currency": string,
      "items": [
        { "name": string, "amount": number }
      ]
    }

    ${file.type === "application/pdf" ? "Here is the receipt text:" : "Analyze the image provided and extract the receipt information."}
  `;

  const result = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: file.type === "application/pdf"
      ? prompt + "\n\n" + content
      : [
          { text: prompt },
          {
            inlineData: {
              mimeType: file.type,
              data: content,
            },
          },
        ],
  });

  const jsonText = result.text?.replace(/```json|```/g, "").trim() || "";

  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", jsonText);
    throw new Error("Failed to parse receipt");
  }
}
