import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

function buildTaskPrompt(body) {
    const interestsText = Array.isArray(body.interests) && body.interests.length > 0
        ? body.interests.join(", ")
        : "Data Structures";

    return `
You are an educational quiz tutor.

Student: ${body.username}
Interests: ${interestsText}

Task:
Generate exactly one beginner learning task based on the student's interests.

Requirements:
- Pick one suitable topic from the student's interests.
- Write a short lesson summary in 1 to 2 sentences.
- Generate exactly 2 multiple choice questions.
- Each question must have exactly 3 answer options.
- Each question must have exactly 1 correct answer.
- Keep the questions clear and suitable for a university beginner.

Return ONLY valid JSON in this exact format:
{
  "topic": "Topic name",
  "lessonSummary": "Short summary",
  "question1": "Question 1 text",
  "answer1A": "Option A",
  "answer1B": "Option B",
  "answer1C": "Option C",
  "correctAnswer1": "One of the three answers exactly",
  "question2": "Question 2 text",
  "answer2A": "Option A",
  "answer2B": "Option B",
  "answer2C": "Option C",
  "correctAnswer2": "One of the three answers exactly"
}
`.trim();
}

function buildPrompt(body) {
    if (body.utility === "hint") {
        return `
You are an educational quiz tutor.

Student: ${body.username}
Topic: ${body.topic}
Lesson summary: ${body.lessonSummary}
Question: ${body.question}
Correct answer: ${body.correctAnswer}

Task:
Give a short hint without directly revealing the answer.
Keep it beginner-friendly and under 80 words.
`.trim();
    }

    if (body.utility === "explain") {
        return `
You are an educational quiz tutor.

Student: ${body.username}
Topic: ${body.topic}
Lesson summary: ${body.lessonSummary}
Question: ${body.question}
Student selected answer: ${body.selectedAnswer}
Correct answer: ${body.correctAnswer}

Task:
1. Say whether the student's answer is correct or incorrect.
2. Explain why in simple language.
3. Give one short improvement tip.

Keep the response under 150 words.
`.trim();
    }

    return `
You are an educational quiz tutor.

Student: ${body.username}
Topic: ${body.topic}
Question: ${body.question}
Student selected answer: ${body.selectedAnswer}
Correct answer: ${body.correctAnswer}

Task:
Give short performance feedback and one study suggestion.
Keep the response under 120 words.
`.trim();
}

app.post("/generate-task", async (req, res) => {
    try {
        if (!req.body.username) {
            return res.status(400).json({
                error: "Username is required."
            });
        }
        const prompt = buildTaskPrompt(req.body);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const rawText = response.text || "";
        const cleanedText = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedText);

        res.json(parsed);
    } catch (error) {
        console.error("Task generation error:", error);
        res.status(500).json({
            topic: "Data Structures",
            lessonSummary: "A stack follows the Last In, First Out principle, and a queue follows First In, First Out.",
            question1: "Which data structure follows the Last In, First Out rule?",
            answer1A: "Queue",
            answer1B: "Stack",
            answer1C: "Array",
            correctAnswer1: "Stack",
            question2: "Which data structure removes the oldest item first?",
            answer2A: "Queue",
            answer2B: "Stack",
            answer2C: "Tree",
            correctAnswer2: "Queue"
        });
    }
});

app.post("/learning-assistant", async (req, res) => {
    try {
        const prompt = buildPrompt(req.body);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.json({
            prompt: prompt,
            response: response.text || "No response returned."
        });
    } catch (error) {
            console.error("Gemini backend error:", error);
            console.error("Message:", error?.message);
            console.error("Status:", error?.status);
            console.error("Cause:", error?.cause);
            console.error("Stack:", error?.stack);

            res.status(500).json({
                prompt: "Prompt generation failed.",
                response:
                    error?.message ||
                    String(error?.cause) ||
                    "Server error while generating learning feedback."
            });
        
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});