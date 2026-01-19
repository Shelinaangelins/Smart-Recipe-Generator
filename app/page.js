"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Label
} from "recharts";
import { FaSearch, FaCarrot, FaUtensils, FaHeartbeat, FaBrain } from "react-icons/fa";
import "./globals.css";

export default function HomePage() {
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [style, setStyle] = useState("");
  const [dishType, setDishType] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [mlResults, setMlResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState("ML Metrics");

  // Generate recipe using backend
  const generateRecipe = async () => {
    if (!ingredients.trim() || !cuisine || !style || !dishType) {
      return alert("Please fill all fields!");
    }
    setLoading(true);
    setRecipes([]);
    setMlResults(null);

    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, cuisine, style, dishType }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setRecipes(data.recipes || []);
      setMlResults({
        predictedCuisine: data.predictedCuisine,
        predictedHealth: data.predictedHealth,
        metrics: data.metrics,
      });
      setSelectedGraph("ML Metrics");
    } catch (e) {
      console.error(e);
      alert("Server error — please check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  // ====== Chart Data ======
  const metricsData = mlResults
    ? [
        { model: "Naive Bayes", ...mlResults.metrics.naiveBayes },
        { model: "Decision Tree", ...mlResults.metrics.decisionTree },
      ]
    : [];

  const ingredientData = recipes.length
    ? (() => {
        const map = {};
        recipes.forEach((r) =>
          r.ingredients.forEach((ing) => {
            map[ing] = (map[ing] || 0) + 1;
          })
        );
        return Object.entries(map).map(([name, value]) => ({ name, value }));
      })()
    : [{ name: "tomato", value: 3 }, { name: "garlic", value: 2 }];

  const healthPieData = recipes.length
    ? (() => {
        const map = {};
        recipes.forEach((r) =>
          r.healthBenefits.forEach((hb) => {
            map[hb] = (map[hb] || 0) + 1;
          })
        );
        return Object.entries(map).map(([name, value]) => ({ name, value }));
      })()
    : [{ name: "High Protein", value: 2 }, { name: "Heart Healthy", value: 1 }];

  const cuisineTrendData = [
    { day: "Mon", Indian: 5, Italian: 3, Chinese: 2, Mexican: 1 },
    { day: "Tue", Indian: 2, Italian: 4, Chinese: 3, Mexican: 2 },
    { day: "Wed", Indian: 3, Italian: 2, Chinese: 4, Mexican: 2 },
    { day: "Thu", Indian: 4, Italian: 3, Chinese: 3, Mexican: 3 },
    { day: "Fri", Indian: 6, Italian: 5, Chinese: 4, Mexican: 4 },
  ];

  const nutritionData = [
    { nutrient: "Carbs", value: 6 },
    { nutrient: "Protein", value: 7 },
    { nutrient: "Fat", value: 4 },
    { nutrient: "Fiber", value: 5 },
    { nutrient: "Vitamins", value: 6 },
  ];

  const flavorData = [
    { name: "Spicy", value: 5 },
    { name: "Sweet", value: 2 },
    { name: "Savory", value: 6 },
    { name: "Sour", value: 1 },
  ];

  const COLORS = ["#f97316", "#10b981", "#60a5fa", "#ef4444", "#a78bfa"];

  // ====== Graph Renderer ======
  const renderGraph = () => {
    switch (selectedGraph) {
      case "ML Metrics":
        return (
          <BarChart width={720} height={350} data={metricsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model">
              <Label value="ML Model" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis label={{ value: "Score (0-1)", angle: -90, position: "insideLeft" }} domain={[0, 1]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="accuracy" fill="#22c55e" />
            <Bar dataKey="precision" fill="#3b82f6" />
            <Bar dataKey="recall" fill="#f97316" />
            <Bar dataKey="f1" fill="#ef4444" />
          </BarChart>
        );
      case "Ingredient Frequency":
        return (
          <BarChart width={720} height={350} data={ingredientData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#f97316" />
          </BarChart>
        );
      case "Health Benefits":
        return (
          <PieChart width={720} height={350}>
            <Pie data={healthPieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={110} label>
              {healthPieData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        );
      case "Cuisine Trends":
        return (
          <LineChart width={720} height={350} data={cuisineTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Indian" stroke="#ef4444" />
            <Line type="monotone" dataKey="Italian" stroke="#f59e0b" />
            <Line type="monotone" dataKey="Chinese" stroke="#60a5fa" />
            <Line type="monotone" dataKey="Mexican" stroke="#10b981" />
          </LineChart>
        );
      case "Nutrition Profile":
        return (
          <RadarChart outerRadius={120} width={720} height={350} data={nutritionData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="nutrient" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.4} />
          </RadarChart>
        );
      case "Flavor Profile":
        return (
          <PieChart width={720} height={350}>
            <Pie data={flavorData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={110} label>
              {flavorData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        );
      default:
        return null;
    }
  };

  const graphDescriptions = {
    "ML Metrics": "Naive Bayes predicts cuisine type; Decision Tree predicts healthy food choices.",
    "Ingredient Frequency": "Shows most frequent ingredients among generated recipes.",
    "Health Benefits": "Distribution of health benefits found across recipes.",
    "Cuisine Trends": "Mock popularity of cuisines across weekdays.",
    "Nutrition Profile": "Balance of nutrients (Carbs, Protein, Fat, Fiber, Vitamins).",
    "Flavor Profile": "Shows how the dish scores on taste attributes like sweet, spicy, savory, sour.",
  };

  return (
    <div className="container">
      <h1>🍽️ Smart Recipe Generator</h1>
      <p className="subtitle">Naive Bayes (Cuisine Prediction) + Decision Tree (Health Factor Prediction)</p>

      <textarea
        className="input-area"
        placeholder="Enter ingredients (e.g., chicken, rice, tomato, spices)"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <div className="grid-3">
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          <option value="">Select Cuisine</option>
          <option>Indian</option>
          <option>Italian</option>
          <option>Chinese</option>
          <option>Mexican</option>
          <option>French</option>
        </select>

        <select value={style} onChange={(e) => setStyle(e.target.value)}>
          <option value="">Select Style</option>
          <option>Homemade</option>
          <option>Restaurant Style</option>
          <option>Street Food</option>
          <option>Healthy</option>
        </select>

        <select value={dishType} onChange={(e) => setDishType(e.target.value)}>
          <option value="">Select Dish Type</option>
          <option>Soup</option>
          <option>Main Course</option>
          <option>Side Dish</option>
          <option>Dessert</option>
          <option>Snack</option>
        </select>
      </div>

      <div className="actions">
        <button onClick={generateRecipe} disabled={loading}>
          {loading ? "🍳 Cooking..." : <><FaSearch /> Generate Recipe</>}
        </button>
      </div>

      {recipes.length > 0 && (
        <div className="recipe-card">
          <h2>{recipes[0].title}</h2>

          <div className="two-columns">
            <div>
              <h3><FaCarrot /> Ingredients</h3>
              <ul>{recipes[0].ingredients.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
            </div>
            <div>
              <h3><FaUtensils /> Steps</h3>
              <ol>{recipes[0].steps.map((s, idx) => <li key={idx}>{s}</li>)}</ol>
            </div>
          </div>

          <div className="ml-results">
            <h3><FaBrain /> Machine Learning Insights</h3>
            <p><strong>Naive Bayes (Cuisine Predictor):</strong> The model analyzes key ingredient patterns (like herbs, spices, sauces) to predict the cuisine. Based on your input, it identifies this dish as <b>{mlResults?.predictedCuisine}</b> cuisine.</p>
            <p><strong>Decision Tree (Health Predictor):</strong> It studies nutrition-related ingredients (like protein, fat, fiber) to determine overall health benefit. The model predicts this dish is <b>{mlResults?.predictedHealth}</b>.</p>

            <div className="metrics-section">
              <h4>Validation Metrics</h4>
              <div className="metric-card">
                <h5>Naive Bayes Metrics</h5>
                <p>Accuracy: {mlResults?.metrics?.naiveBayes?.accuracy}</p>
                <p>Precision: {mlResults?.metrics?.naiveBayes?.precision}</p>
                <p>Recall: {mlResults?.metrics?.naiveBayes?.recall}</p>
                <p>F1 Score: {mlResults?.metrics?.naiveBayes?.f1}</p>
              </div>

              <div className="metric-card">
                <h5>Decision Tree Metrics</h5>
                <p>Accuracy: {mlResults?.metrics?.decisionTree?.accuracy}</p>
                <p>Precision: {mlResults?.metrics?.decisionTree?.precision}</p>
                <p>Recall: {mlResults?.metrics?.decisionTree?.recall}</p>
                <p>F1 Score: {mlResults?.metrics?.decisionTree?.f1}</p>
              </div>
            </div>
          </div>

          <div className="graph-controls">
            <select className="graph-select" value={selectedGraph} onChange={(e) => setSelectedGraph(e.target.value)}>
              <option>ML Metrics</option>
              <option>Ingredient Frequency</option>
              <option>Health Benefits</option>
              <option>Cuisine Trends</option>
              <option>Nutrition Profile</option>
              <option>Flavor Profile</option>
            </select>
            <p className="graph-desc">{graphDescriptions[selectedGraph]}</p>
          </div>

          <div className="graph-wrapper">{renderGraph()}</div>
        </div>
      )}
    </div>
  );
}
