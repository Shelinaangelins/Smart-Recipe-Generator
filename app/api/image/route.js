import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { ingredients, cuisine, style } = await req.json();

    const recipePrompt = `
    Create a ${style.toLowerCase()} ${cuisine.toLowerCase()} recipe using these ingredients: ${ingredients}.
    Please include:
    1. A realistic recipe title
    2. A list of ingredients (use bullet points)
    3. Step-by-step cooking instructions (numbered)
    Make it sound natural and easy to follow.
    `;

    // 🔹 Generate recipe text
    const textRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: recipePrompt }],
    });

    const text = textRes.choices[0].message.content;

    // 🔹 Split and structure recipe output
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    const title = lines[0].replace(/^#+\s*/, "").trim();

    const ingredientsList = lines
      .filter((l) => l.startsWith("•") || l.startsWith("-"))
      .map((l) => l.replace(/^[-•]\s*/, "").trim());

    const stepsList = lines.filter((l) => /^[0-9]+[.)]/.test(l.trim()));

    // 🔹 Generate recipe image
    const imagePrompt = `${title}, ${cuisine} cuisine, ${style} presentation, professionally plated, natural lighting`;
    const imgRes = await client.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      n: 2,
      size: "512x512",
    });

    const imageUrls = imgRes.data.map((img) => img.url);

    // ✅ Return final recipe data
    return NextResponse.json({
      title,
      ingredients: ingredientsList,
      steps: stepsList,
      imageUrls,
    });
  } catch (err) {
    console.error("Recipe generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate recipe. Please try again later." },
      { status: 500 }
    );
  }
}
