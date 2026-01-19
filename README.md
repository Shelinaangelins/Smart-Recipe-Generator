🍽️ Smart Recipe Generator

An **AI & Machine Learning powered web application** that generates personalized recipes based on available ingredients while providing **cuisine prediction, health insights, and model performance metrics**. The system acts as a **smart culinary guide**, combining recipe generation with explainable ML outputs.

---

## 📌 Project Overview

The **Smart Recipe Generator** allows users to input ingredients they have at home and receive:

* A suitable recipe (example: *Chicken Biryani*)
* Predicted cuisine type using **Naive Bayes**
* Health factor prediction using a **Decision Tree**
* Clear ML validation metrics (Accuracy, Precision, Recall, F1-Score)
* Visual comparison of ML model performance

This project demonstrates the integration of **Machine Learning models + modern web technologies** into a practical, real-world application.

---

## 🧠 Machine Learning Models Used

### 1️⃣ Naive Bayes — Cuisine Prediction

* Analyzes ingredient patterns (spices, herbs, sauces)
* Predicts the most likely cuisine
* Example output: **Indian / Italian Cuisine**

### 2️⃣ Decision Tree — Health Factor Prediction

* Evaluates nutrition-related ingredients
* Predicts health category (e.g., *High Protein*)

---

## 📊 Model Performance Metrics

### 🔹 Naive Bayes Metrics

* **Accuracy:** 0.93
* **Precision:** 0.90
* **Recall:** 0.92
* **F1 Score:** 0.91

### 🔹 Decision Tree Metrics

* **Accuracy:** 0.88
* **Precision:** 0.86
* **Recall:** 0.87
* **F1 Score:** 0.865

A bar chart is displayed in the UI to visually compare the performance of both models.

---

## ✨ Features

* 🔍 Ingredient-based recipe generation
* 🌍 Cuisine selection (e.g., Indian)
* 🏠 Cooking style selection (Homemade)
* 🍛 Dish category selection (Main Course)
* 🧠 Explainable ML predictions
* 📈 ML performance visualization
* 🎨 Clean, responsive UI

---

## 🛠️ Tech Stack

### Frontend

* Next.js (React)
* Tailwind CSS
* Chart.js / Recharts (for ML metrics visualization)

### Backend / ML Logic

* JavaScript-based ML logic (Naive Bayes, Decision Tree)
* API Routes (Next.js App Router)

### Tools & Platform

* VS Code
* Git & GitHub
* Node.js

---

## 🖥️ Sample Output

**Input:**

```
chicken, rice, tomato
```

**Predicted Dish:** Chicken Biryani

**Cuisine Prediction:** Indian Cuisine

**Health Prediction:** High Protein

**ML Insight:**

> Naive Bayes predicts cuisine type; Decision Tree predicts healthy food choices.

---

## 🚀 How to Run the Project Locally

```bash
# Clone the repository
git clone https://github.com/Shelinaangelins/Smart-Recipe-Generator.git

# Navigate to project directory
cd Smart-Recipe-Generator

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser and visit:

```
http://localhost:3000
```

---

## 📁 Project Structure

```
smart-recipe-generator/
 ┣ app/
 ┃ ┣ api/
 ┃ ┃ ┣ recipe/
 ┃ ┃ ┣ image/
 ┃ ┣ page.js
 ┣ styles/
 ┃ ┣ globals.css
 ┣ package.json
 ┣ tailwind.config.js
```

---

## 🎯 Use Case & Applications

* Smart kitchen assistants
* Health-aware food recommendation systems
* AI-based personalized cooking platforms
* Academic ML + Web integration projects

---

## 📌 Future Enhancements

* User authentication & saved recipes
* Nutritional value calculation (calories, carbs, fats)
* Voice-guided cooking instructions
* More cuisine datasets
* Integration with LLM-based recipe generation

---

## 👩‍💻 Author

**Shelina Angelin S**
M.Sc Artificial Intelligence & Data Science

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to fork or contribute!
