import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import crypto from "crypto";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Compute SHA-256 hash of file buffer
function computeFileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const participants = formData.get("participants") as string;
    const splitInstructions = formData.get("splitInstructions") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = computeFileHash(buffer);

    // Check cache first
    const cached = await convex.query(api.receiptCache.getByHash, { fileHash });
    if (cached) {
      console.log("Cache hit for file hash:", fileHash);
      return NextResponse.json(cached.response);
    }

    console.log("Cache miss for file hash:", fileHash);
    const base64Data = buffer.toString("base64");

    // Parse participants if provided
    let participantsList: string[] = [];
    if (participants) {
      try {
        participantsList = JSON.parse(participants);
      } catch {
        participantsList = [];
      }
    }

    // Build the prompt
    let prompt = `You are an expert receipt parser. Analyze this receipt image/document carefully.

Extract ALL items from the receipt with their exact prices. Be thorough - don't miss any items.

Important guidelines:
- Include all food items, drinks, appetizers, desserts, etc.
- Use the exact item names as shown on the receipt
- Prices should be numbers without currency symbols
- If an item has modifiers or add-ons with separate prices, list them separately
- The total should match the receipt's total (including tax/tip if shown)
- Extract tax and tip amounts separately (NOT as items in the items array)

CRITICAL - Exclude non-contributing items:
- Do NOT include items marked as "unavailable", "out of stock", "rejected", "cancelled", "voided", "refunded", or similar
- Do NOT include items with $0.00 price that are clearly not applicable
- Do NOT include discount lines, promo codes, or negative adjustments as items (these reduce the total but are not billable items)
- Only include items that actually contribute to the final bill amount`;

    if (participantsList.length > 0) {
      prompt += `\n\nThe following people are splitting this bill: ${participantsList.join(", ")}`;
    }

    if (splitInstructions) {
      prompt += `\n\nAdditional context for splitting: ${splitInstructions}`;
      prompt += `\n\nBased on the split instructions, suggest which participants should be assigned to each item. If no specific instruction applies to an item, leave suggestedParticipants empty.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        prompt,
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restaurantName: {
              type: Type.STRING,
              description: "Name of the restaurant/store if visible",
            },
            date: {
              type: Type.STRING,
              description: "Date on the receipt if visible (YYYY-MM-DD format)",
            },
            total: {
              type: Type.NUMBER,
              description: "The total amount on the receipt",
            },
            subtotal: {
              type: Type.NUMBER,
              description: "Subtotal before tax/tip if shown",
            },
            tax: {
              type: Type.NUMBER,
              description: "Tax amount if shown separately",
            },
            tip: {
              type: Type.NUMBER,
              description: "Tip amount if shown",
            },
            currency: {
              type: Type.STRING,
              description: "The currency code (e.g., USD, EUR, INR)",
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "The name of the item",
                  },
                  amount: {
                    type: Type.NUMBER,
                    description: "The price of the item",
                  },
                  quantity: {
                    type: Type.INTEGER,
                    description: "Quantity of the item (default 1)",
                  },
                  suggestedParticipants: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description:
                      "Suggested participants for this item based on split instructions",
                  },
                },
                propertyOrdering: [
                  "name",
                  "amount",
                  "quantity",
                  "suggestedParticipants",
                ],
              },
              description: "List of items on the receipt",
            },
          },
          propertyOrdering: [
            "restaurantName",
            "date",
            "subtotal",
            "tax",
            "tip",
            "total",
            "currency",
            "items",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    // Store in cache
    await convex.mutation(api.receiptCache.store, {
      fileHash,
      response: JSON.stringify(result),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Receipt processing error:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}
