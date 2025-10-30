// Fix: Implement the Gemini service to handle conversation processing.
import { Message, FileContent } from '../types';

// 检查是否安装了@google/genai包
let googleGenAIAvailable = false;
let GoogleGenAI: any;
let Type: any;

try {
  const genai = require('@google/genai');
  GoogleGenAI = genai.GoogleGenAI;
  Type = genai.Type;
  googleGenAIAvailable = true;
} catch (error) {
  console.warn('@google/genai包未安装，Gemini功能将不可用');
  googleGenAIAvailable = false;
}

// 获取Google API密钥
const getGoogleApiKey = (): string => {
  const apiKey = localStorage.getItem('google_api_key');
  if (!apiKey) {
    throw new Error('Google API密钥未设置。请在设置中手动输入API密钥。');
  }
  return apiKey.trim();
};

// 只有在包可用时才创建实例（动态创建，避免环境变量依赖）
const createGoogleAIInstance = () => {
  if (!googleGenAIAvailable) return null;
  try {
    const apiKey = getGoogleApiKey();
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('Google API密钥未配置，Gemini功能将不可用');
    return null;
  }
};

const SYSTEM_INSTRUCTION = `You are a world-class expert in prompt engineering. Your purpose is to act as an AI copilot to help users craft the perfect, detailed, and effective prompt for their specific needs.
You will engage in a conversation with the user to iteratively refine their prompt.
After each user message, you MUST perform two actions:
1.  **Refine the Prompt**: Based on the entire conversation history, generate an updated and improved version of the prompt. If it's the beginning of the conversation, create an initial prompt based on the user's request. The prompt should be clear, concise, and structured for optimal performance with generative AI models.
2.  **Suggest Next Step**: Provide a friendly, conversational suggestion or a clarifying question to the user. This should guide them on what information to provide next to further improve the prompt.

Your final output MUST be a single, valid JSON object, and nothing else. Do not wrap it in markdown backticks or any other formatting.
The JSON object must have exactly these two keys:
-   "prompt": A string containing the latest, refined prompt.
-   "suggestion": A string containing your conversational suggestion or question for the user.

Example conversation flow:
User: "I need a prompt for a marketing image."
Your JSON output:
{
  "prompt": "Generate a vibrant and eye-catching marketing image for a new brand of organic coffee. The image should feature a steaming mug of coffee on a rustic wooden table, with fresh coffee beans scattered around. The background should be a blurred, warm-toned café setting. The overall mood should be cozy and inviting. Aspect ratio: 16:9.",
  "suggestion": "That's a good start! To make the prompt even better, could you tell me about the target audience? For example, are they young professionals, students, or families?"
}
User: "The target audience is young professionals in urban areas."
Your JSON output:
{
  "prompt": "Generate a sleek and modern marketing image targeting young urban professionals for a new brand of organic coffee. The image should feature a steaming, minimalist-style mug of coffee on a polished concrete or dark wood surface. Include subtle elements of technology, like a nearby smartphone or laptop. The background should be a chic, minimalist café with industrial design elements. The lighting should be bright and natural. The overall mood should be sophisticated and energetic. Aspect ratio: 16:9.",
  "suggestion": "Great! How about the brand's personality? Is it luxurious, eco-friendly, or energetic? This will help tailor the visual style."
}`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        prompt: { type: Type.STRING, description: "The refined prompt based on the conversation." },
        suggestion: { type: Type.STRING, description: "A conversational follow-up question or suggestion." },
    },
    required: ['prompt', 'suggestion'],
};

// Helper to convert app messages to Gemini's format
const convertMessagesToGeminiContent = (messages: Message[]): any[] => {
    if (!googleGenAIAvailable) return [];
    
    return messages.map((msg) => {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        
        const parts: any[] = [];
        if (typeof msg.content === 'string') {
            parts.push({ text: msg.content });
        } else {
            (msg.content as (string | FileContent)[]).forEach(part => {
                if (typeof part === 'string') {
                    parts.push({ text: part });
                } else if (part.type === 'image') {
                    parts.push({
                        inlineData: {
                            data: part.data,
                            mimeType: part.mimeType
                        }
                    });
                } else if (part.type === 'document') {
                    // Treat document content as text, with a clear separator
                    parts.push({ text: `\n\n--- Attached Document: ${part.name} ---\n\n${part.data}` });
                }
            });
        }

        return { role, parts };
    });
};

export const processConversation = async (messages: Message[]): Promise<{ prompt: string, suggestion:string }> => {
    try {
        // 检查Google GenAI是否可用
        if (!googleGenAIAvailable) {
            throw new Error('Google GenAI功能不可用，请安装@google/genai包或切换到硅基流动API');
        }
        
        // 动态创建实例
        const aiInstance = createGoogleAIInstance();
        if (!aiInstance) {
            throw new Error('Google API密钥未配置，请在设置中手动输入API密钥。');
        }

        const contents = convertMessagesToGeminiContent(messages);

        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-pro', // Use a more capable model for reasoning and strict JSON output
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7, // A bit of creativity in suggestions
            }
        });

        const text = response.text;
        
        // The model can sometimes wrap the JSON in markdown backticks, or return an empty string.
        // This logic cleans the response and ensures it's valid before parsing.
        const cleanedText = text.trim().replace(/^```json/, '').replace(/```$/, '').trim();

        if (!cleanedText) {
            console.error("The AI returned an empty response.");
            throw new Error("The AI returned an empty response, which might be due to safety settings or an internal error.");
        }

        let result;
        try {
           result = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse JSON response:", text);
            console.error("Attempted to parse cleaned text:", cleanedText);
            throw new Error("Received a non-JSON response from the AI.");
        }


        if (result && typeof result.prompt === 'string' && typeof result.suggestion === 'string') {
            return result;
        } else {
            console.error("Invalid JSON structure received from API:", result);
            throw new Error("Received an invalid response from the AI. The JSON structure is incorrect.");
        }
    } catch (error) {
        console.error("Error processing conversation with Gemini:", error);
        throw new Error("Failed to get a response from the AI. Please try again.");
    }
};