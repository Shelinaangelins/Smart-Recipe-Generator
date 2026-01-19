// app/api/recipe/route.js
import OpenAI from "openai";
import { DecisionTreeClassifier } from "ml-cart";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple Naive Bayes (lightweight)
class SimpleNaiveBayes {
  constructor() {
    this.likelihoods = {};
    this.classProbabilities = {};
    this.classes = [];
  }
  train(X, y) {
    const counts = {};
    const total = y.length;
    y.forEach((label, i) => {
      if (!counts[label]) counts[label] = { total: 0, sums: Array(X[0].length).fill(0) };
      counts[label].total++;
      X[i].forEach((v, j) => (counts[label].sums[j] += v));
    });
    this.classes = Object.keys(counts);
    this.classes.forEach((c) => {
      this.classProbabilities[c] = counts[c].total / total;
      this.likelihoods[c] = counts[c].sums.map((s) => s / counts[c].total);
    });
  }
  predict(X) {
    return X.map((sample) => {
      let best = null;
      let bestScore = -Infinity;
      this.classes.forEach((c) => {
        let score = Math.log(this.classProbabilities[c] || 1e-9);
        this.likelihoods[c].forEach((p, idx) => {
          score += (sample[idx] || 0) * Math.log(p || 1e-9);
        });
        if (score > bestScore) {
          bestScore = score;
          best = c;
        }
      });
      return best;
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { ingredients, cuisine, style, dishType } = body || {};

    if (!ingredients || !cuisine || !style || !dishType) {
      return new Response(JSON.stringify({ error: "Please provide ingredients, cuisine, style and dishType." }), { status: 400 });
    }

    // 1) Try to get recipes from OpenAI (if key present). If fails, fallback to mock.
    const prompt = `
You are a professional chef. Create 3 creative ${dishType} recipes.
Cuisine: ${cuisine}, Style: ${style}.
Main ingredients: ${ingredients}.
Return valid JSON only in this format:
[
  {
    "title": "Recipe Name",
    "ingredients": ["ingredient1", "ingredient2"],
    "steps": ["Step 1", "Step 2"],
    "healthBenefits": ["Benefit 1", "Benefit 2"]
  }
]
    `.trim();

    let recipes = [];
    try {
      if (process.env.OPENAI_API_KEY) {
        const aiRes = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 700,
        });
        let aiText = aiRes.choices?.[0]?.message?.content || "";
        aiText = aiText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(aiText);
        if (Array.isArray(parsed)) recipes = parsed;
      }
    } catch (e) {
      // fallback below
      console.warn("OpenAI parsing/response failed — falling back to mock recipes.", e?.message || e);
    }

    if (!recipes || recipes.length === 0) {
      const base = (ingredients || "").split(",").map((s) => s.trim()).filter(Boolean);
      recipes = [
        {
          title: `Quick ${base[0] || "Dish"}`,
          ingredients: base,
          steps: ["Combine ingredients", "Cook on medium heat", "Garnish & serve"],
          healthBenefits: ["Balanced nutrition", "Easy to make"],
        },
        {
          title: `Homestyle ${base[0] || "Recipe"}`,
          ingredients: base,
          steps: ["Chop ingredients", "Sauté with spices", "Serve hot"],
          healthBenefits: ["Comfort food", "Nutritious"],
        },
        {
          title: `Fresh ${base[0] || "Salad"}`,
          ingredients: base,
          steps: ["Chop", "Toss with dressing", "Serve chilled"],
          healthBenefits: ["Light", "High in fibre"],
        },
      ];
    }

    // ----------------------
// 🧠 Naive Bayes Cuisine Predictor (smarter keywords)
const nb = new SimpleNaiveBayes();
const nbX = [
  [1, 0, 0, 0, 0], // Indian
  [0, 1, 0, 0, 0], // Italian
  [0, 0, 1, 0, 0], // Chinese
  [0, 0, 0, 1, 0], // Mexican
  [0, 0, 0, 0, 1], // French
];
const nbY = ["Indian", "Italian", "Chinese", "Mexican", "French"];
nb.train(nbX, nbY);

// 🌎 broader ingredient associations
const cuisineKeywords = {
  Indian: ["turmeric", "curry", "masala", "ginger", "garam", "dal", "spices"],
  Italian: ["basil", "olive oil", "tomato", "mozzarella", "pasta", "parmesan"],
  Chinese: ["soy", "ginger", "garlic", "noodles", "sesame", "chili sauce"],
  Mexican: ["beans", "chili", "tortilla", "avocado", "salsa", "corn"],
  French: ["butter", "cream", "wine", "cheese", "herbs", "onion"],
};

// 🧩 build the encoded vector based on actual matches
const lowerInp = ingredients.toLowerCase();
const encoded = [
  cuisineKeywords.Indian.some((k) => lowerInp.includes(k)) ? 1 : 0,
  cuisineKeywords.Italian.some((k) => lowerInp.includes(k)) ? 1 : 0,
  cuisineKeywords.Chinese.some((k) => lowerInp.includes(k)) ? 1 : 0,
  cuisineKeywords.Mexican.some((k) => lowerInp.includes(k)) ? 1 : 0,
  cuisineKeywords.French.some((k) => lowerInp.includes(k)) ? 1 : 0,
];

let predictedCuisine = nb.predict([encoded])[0];

// 🧩 fallback: if all 0’s, use user-selected cuisine
if (!encoded.some((v) => v === 1)) {
  predictedCuisine = cuisine;
}


    // ----------------------
    // Decision Tree for health prediction (tiny in-memory training)
    // ----------------------
    const dtTraining = [
      { features: [1, 0, 0], label: "High Protein" }, // protein heavy
      { features: [0, 1, 0], label: "Low Fat" }, // low fat
      { features: [0, 0, 1], label: "High Fiber" }, // fiber
      { features: [1, 1, 0], label: "Heart Healthy" },
      { features: [0, 1, 1], label: "Energy Booster" },
    ];

    const X = dtTraining.map((d) => Array.from(d.features));
    const y = dtTraining.map((d) => d.label);

    // validation checks
    if (!Array.isArray(X) || !Array.isArray(y) || X.length !== y.length) {
      throw new Error("Decision Tree data mismatch");
    }
    if (X.some((r) => !Array.isArray(r) || r.length !== X[0].length)) {
      throw new Error("Decision Tree feature arrays not uniform");
    }

    const dt = new DecisionTreeClassifier({ gainFunction: "gini", maxDepth: 3, minNumSamples: 1 });
    try {
      dt.train(X, y);
    } catch (e) {
      console.warn("Decision Tree training threw, continuing with fallback predictions", e?.message || e);
    }

    // simple test input for predicted health: encode presence of protein/fat/fiber
    const test = [
      (lowerInp.match(/\b(chicken|egg|paneer|tofu|beans|lentil)\b/) ? 1 : 0),
      (lowerInp.match(/\b(olive oil|butter|ghee|avocado|nuts|salmon)\b/) ? 1 : 0),
      (lowerInp.match(/\b(leafy|broccoli|spinach|oats|brown rice|fiber)\b/) ? 1 : 0),
    ];
    let predictedHealth = "Balanced Nutrition";
    try {
      const pred = dt.predict([test]);
      if (Array.isArray(pred) && pred[0]) predictedHealth = pred[0];
    } catch (e) {
      // fallback
      if (test[0]) predictedHealth = "High Protein";
      else if (test[2]) predictedHealth = "High Fiber";
      else predictedHealth = "Balanced Nutrition";
    }

    // ----------------------
    // Mock metrics (for graphs). In a real pipeline you'd compute these from holdout test sets.
    // ----------------------
    const metrics = {
      naiveBayes: { accuracy: 0.93, precision: 0.9, recall: 0.92, f1: 0.91 },
      decisionTree: { accuracy: 0.88, precision: 0.86, recall: 0.87, f1: 0.865 },
    };

    // Add cluster or other meta if you want; we return recipes + ml outputs
    return new Response(JSON.stringify({ recipes, predictedCuisine, predictedHealth, metrics }), { status: 200 });
  } catch (err) {
    console.error("❌ /api/recipe error:", err);
    return new Response(JSON.stringify({ error: "Server error", details: err?.message || null }), { status: 500 });
  }
}
