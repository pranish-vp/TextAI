const OpenAI = require("openai");
require("dotenv").config();
const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
  });

async function createAssistant() {

    const assistant = await openai.beta.assistants.create({
        name: "TextAI Assistant 2",
        description: "You are a master at using serpapi, which uses Google Search, Google Trends, Google Reviews API to fetch the data as provided by the user, convey every details to user in detail and do not make up any information.",
        model: "gpt-3.5-turbo",
      });
    console.log(assistant);
}

createAssistant();

/* const assistant = await openai.beta.assistants.update("asst_YXRO0DMVcSsu2xagHTRX7i2p", {
    name: "Text AI 2",
    instructions: "You are a good helpful assistant",
    model: "gpt-3.5-turbo-0125"
}); */