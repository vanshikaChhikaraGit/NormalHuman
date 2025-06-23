"use server";

import { createStreamableValue } from "ai/rsc";

export async function generateEmail(context: string, prompt: string) {
  const stream = createStreamableValue("");

  (async () => {
    try {
      const currentTime = new Date().toLocaleString();

      // Validate environment variable
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in environment variables");
      }

      const requestBody = {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an AI email assistant to enhance user productivity and streamline email management.
            Your purpose is to help the user compose emails by providing suggestions and relevant email responses.
            Your purpose might also include composing full-fledged emails based upon the context served to you.
            Don't hallucinate and generate any information which is out of context or irrelevant.

            THE TIME IS ${currentTime}

            START CONTEXT BLOCK
            ${context}
            END CONTEXT BLOCK

            When responding, please keep in mind:
            - Be helpful, clever, and articulate
            - Rely on the provided email context to inform your response
            - If context is insufficient, politely give a draft
            - Avoid apologizing for previous responses
            - Don't invent unsupported information
            - Keep responses focused and relevant
            - Don't add fluff like "Here's your email"
            - Directly output the email content`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
        temperature: 0.7,
      };

      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!groqResponse.ok) {
        const errorBody = await groqResponse.text();
        console.error("Groq API Error:", {
          status: groqResponse.status,
          statusText: groqResponse.statusText,
          body: errorBody,
        });
        throw new Error(`Groq API request failed: ${groqResponse.statusText}`);
      }

      const reader = groqResponse.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.startsWith("data:")) {
            const data = line.replace("data: ", "");
            if (data === "[DONE]") {
              stream.done();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices[0]?.delta?.content;
              if (token) stream.update(token);
            } catch (error) {
              console.error("Error parsing JSON:", error, "Data:", data);
            }
          }
        }
      }
    } catch (error) {
      console.error("Groq streaming error:", error);
      stream.error("Failed to generate response. Please try again.");
    }
  })();

  return {
    output: stream.value,
  };
}
export async function generate(input: string) {
  console.log("input",input)
  const stream = createStreamableValue("");

  (async () => {
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in environment variables");
      }

      // const requestBody = {
      //   model: "llama-3.3-70b-versatile",
      //   messages: [
      //     {
      //       role: "system",
      //       content: `
      //       ALWAYS RESPOND IN PLAIN TEXT, no html or markdown.
      //      You are a helpful AI embedded in a email client app that is used to autocomplete sentences, similar to google gmail
      //      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      //      AI is a well-behaved and well-mannered individual.
      //      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      //      I am writing a piece of text in a notion text editor app.
      //      Help me complete my train of thought here: ${input}
      //      keep the tone of the text consistent with the rest of the text.
      //      keep the response short and sweet. Act like a copilot, finish my sentence if need be, but don't try to generate a
      //      Do not add fluff like "I'm here to help you" or "I'm a helpful AI" or anything like that.
      //      Example:
      //      Dear Alice, I'm sorry to hear that you are feeling down.
      //      Output: Unfortunately, I can't help you with that.
      //      Your output is DIRECTLY CONCATENATED to the input, so DO NOT add any new lines or formatting
      //      `,
      //     },
      //   ],
      //   stream: true,
      //   temperature: 0.7,
      // };

      const requestBody = {
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: `
      You are an advanced email autocomplete AI that helps users write emails faster.
      RULES:
      1. ONLY provide the most likely continuation of the text. It can be as long as possible as you think.
      2. NEVER add new lines or formatting
      3. Match the tone and style of the input text
      4. If input is too short or unclear, suggest common email phrases
      5. NEVER add meta-commentary about being an AI
      6. Take care of grammar and overall sentence formation should be according to english language rules.
      7. Take care of grammar and overall sentence formation should be according to english language rules.
      8. This a professional set up, so always use professional, standard and business language
      9. Inappropriate words, context or resulting sentences that might lead to something improper are strictly 
      prohibited

      EXAMPLES:
      Input: "Hi John, I'm following up"
      Output: "on our meeting yesterday"

      Input: "The project deadline is"
      Output: "coming up soon"

      Input: "I'm not feeling"
      Output: "very well today"

      Current input to complete: ${input}
      `
    },
    {
      role: "user",
      content: input
    }
  ],
  stream: true,
  temperature: 0.4,  // Lower for more predictable completions
};

      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!groqResponse.ok) {
        const errorBody = await groqResponse.text();
        console.error("Groq API Error:", {
          status: groqResponse.status,
          statusText: groqResponse.statusText,
          body: errorBody,
        });
        throw new Error(`Groq API request failed: ${groqResponse.statusText}`);
      }

      const reader = groqResponse.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.startsWith("data:")) {
            const data = line.replace("data: ", "");
            if (data === "[DONE]") {
              stream.done();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices[0]?.delta?.content;
              if (token) stream.update(token);
            } catch (error) {
              console.error("Error parsing JSON:", error, "Data:", data);
            }
          }
        }
      }
    } catch (error) {
      console.error("Groq streaming error:", error);
      stream.error("Failed to generate response. Please try again.");
    }
  })();

  return {
    output: stream.value,
  };
}
