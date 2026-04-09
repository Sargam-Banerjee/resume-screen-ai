import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function screenResume(resumeText: string, jobDescription: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Screen the following resume against the job description.
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        RESUME:
        ${resumeText}
      `,
      config: {
        systemInstruction: "You are an expert HR recruiter. Analyze the resume against the job requirements. Provide a score from 0-100 and a detailed analysis of fit, including strengths and gaps.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Match score from 0 to 100" },
            summary: { type: Type.STRING, description: "A concise 1-2 sentence summary of the candidate's fit" },
            analysis: { type: Type.STRING, description: "Detailed analysis of the candidate's fit" },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of top strengths" },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of missing requirements or weaknesses" },
            improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific skills or areas the candidate should focus on to improve their fit" },
            interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Targeted interview questions based on the resume content and gaps" }
          },
          required: ["score", "summary", "analysis", "keyStrengths", "gaps", "improvementSuggestions", "interviewQuestions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Screening Error:", error);
    throw error;
  }
}

export async function generateJobDescription(jobTitle: string, experienceLevel: string, additionalContext?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Generate a professional job description and a list of required skills for the following position.
        
        JOB TITLE: ${jobTitle}
        EXPERIENCE LEVEL: ${experienceLevel}
        ${additionalContext ? `ADDITIONAL CONTEXT/REQUIREMENTS: ${additionalContext}` : ''}
      `,
      config: {
        systemInstruction: "You are an expert HR copywriter. Create a compelling job posting. Include a professional description, a comprehensive list of required skills, a profile of the ideal candidate, and suggested interview questions. The content should be professional, engaging, and tailored to the specified experience level. If additional context is provided, incorporate it naturally.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A detailed job description" },
            skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of required skills" },
            idealCandidate: { type: Type.STRING, description: "A description of the ideal candidate profile" },
            suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested interview questions for this role" }
          },
          required: ["description", "skills", "idealCandidate", "suggestedQuestions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Job Description Error:", error);
    throw error;
  }
}

export async function generateHiringEmail(candidateName: string, jobTitle: string, recruiterName: string, companyName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Generate a professional and enthusiastic hiring email for a candidate who has just been offered a job.
        
        CANDIDATE NAME: ${candidateName}
        JOB TITLE: ${jobTitle}
        RECRUITER NAME: ${recruiterName}
        COMPANY NAME: ${companyName}
      `,
      config: {
        systemInstruction: "You are an expert HR communicator. Create a warm, professional, and clear job offer email. Include a clear subject line, a congratulatory opening, details about the role, and next steps for onboarding. The tone should be welcoming and professional.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "Professional subject line for the email" },
            body: { type: Type.STRING, description: "The full body of the email in a professional format" }
          },
          required: ["subject", "body"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Hiring Email Error:", error);
    throw error;
  }
}
