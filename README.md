# FoodSaver AI

## App Overview

**FoodSaver AI** is an AI-powered pantry management web application designed to help users reduce food waste by making better use of ingredients they already have at home.

The application uses Artificial Intelligence to generate personalized recipes, suggest creative leftover meal ideas, recommend ingredient substitutions, and provide food storage tips.

FoodSaver AI is useful for students, families, and individuals who want to save money, manage their food resources efficiently, and reduce unnecessary waste.

---
# Live Demo

**Live URL:**

https://foodsaver.ai.studio

---

# Problem Statement

Food waste is a major problem in many households. People often forget available ingredients, buy unnecessary items, or throw away leftovers because they do not know how to reuse them.

FoodSaver AI solves this problem by providing an intelligent assistant that suggests practical ways to use available ingredients.

---

# Solution

FoodSaver AI provides a simple platform where users can:

- Add ingredients available in their pantry
- Get AI-generated meal recommendations
- Generate complete cooking recipes
- Find ingredient alternatives
- Discover leftover meal ideas
- Learn proper food storage methods

---

# Features

## Pantry Management

- Add pantry ingredients
- Add ingredient quantities
- View available food items
- Manage pantry information

## AI Recipe Generator

- Generates three meal ideas from available ingredients
- Creates complete step-by-step recipes
- Provides beginner-friendly cooking instructions
- Suggests practical meals based on user input

## Ingredient Substitution

- Suggests replacement ingredients
- Helps users cook even when some ingredients are unavailable

## Leftover Meal Ideas

- Generates creative ways to reuse leftover food
- Helps reduce food wastage

## Food Storage Tips

- Provides storage recommendations
- Helps increase ingredient freshness and shelf life

## User Interface

- Clean and modern design
- Responsive web interface
- Easy-to-use experience

---

# AI Feature

FoodSaver AI integrates **Google Gemini AI** to provide intelligent cooking assistance.

The AI feature analyzes the ingredients entered by users and generates:

- Recipe suggestions
- Meal ideas
- Ingredient substitutions
- Leftover ideas
- Food storage recommendations

---

# AI System Instructions / Prompt

The AI assistant follows this instruction:
### AI Instructions / System Prompt

The AI receives the following instructions:

> You are a helpful home cooking assistant. The user will give you a list of pantry ingredients with quantities. Based ONLY on what's available (plus common staples like salt, oil, water, pepper), suggest:
>
> 1. Three meal ideas using these ingredients.
> 2. A step-by-step recipe for the best-fitting idea.
> 3. One creative way to use likely leftovers.
>
> Keep instructions short, practical, and beginner-friendly. If key ingredients are missing for a normal dish, suggest suitable substitutions.

---

# Technologies Used

## AI & Development Tools

- Google AI Studio
- Google Gemini AI
- Visual Studio Code
- Git
- GitHub

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

## AI Integration

- Google Gemini API
- Google GenAI SDK
- Gemini Flash Model

## Deployment

- Google AI Studio App Publishing

---

# 📸 Screenshots

## Home Screen

![Home](screenshots/home.png)


## Pantry Management

![Pantry](screenshots/pantry.png)


## AI Recipe Generation

![Recipe](screenshots/recipe.png)


## Food Storage Tips

![Storage](screenshots/storage.png)

---

# Running the Project Locally

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/foodsaver-ai.git


### How to Run the Project Locally

Follow these steps to run **FoodSaver AI** on your local system.

### 2. Open the Project Folder

Move into the project directory:

```bash
cd foodsaver-ai
```

### 3. Install Dependencies

Install all required project dependencies:

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory of the project and add your Google Gemini API key:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace `YOUR_GEMINI_API_KEY` with your actual Gemini API key.

### 5. Start the Development Server

Run the application using:

```bash
npm run dev
```

The application will start locally and can be accessed at:

```
http://localhost:3000
`
