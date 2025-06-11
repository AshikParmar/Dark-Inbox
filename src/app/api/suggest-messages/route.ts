// import { openai } from '@ai-sdk/openai';
// import { streamText } from 'ai';

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//     const prompt =
//     "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

//     try {
//         const result = streamText({
//             model: openai('gpt-4o'),
//             prompt,
//         });

//         return result.toDataStreamResponse();
//     } catch (error) {
//         console.error("An unexpected error occured: ", error)
//         throw error
//     }
// }


import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Generate a new set of three unique, open-ended, and engaging questions each time you are prompted. Format them as a single string, separated by '||'. These questions are intended for an anonymous social messaging platform like Qooh.me and should be appropriate for a diverse, general audience. Avoid personal, political, or sensitive topics. Focus on universal themes that spark friendly curiosity, light-hearted reflection, or interesting conversation. Each response must contain new, non-repetitive questions different from earlier responses. Make sure each question encourages a thoughtful or fun answer. Follow this format: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?' Add some creative variety — imagine this is the 100th time you're answering this prompt.";


  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}