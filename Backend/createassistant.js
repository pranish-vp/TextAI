const OpenAI = require("openai");
require("dotenv").config();
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

async function createAssistant() {

  const tools = [
    {
      type: "function",
      function: {
        name: "search_google",
        description: "Use Google search api to search for what user has inputted",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "The query user wants to search in google, whatever input user wants to search eg: Coffee, Mango, President of usa",
            },
            location: {
              type: "string",
              description: " The location user wants to search in, what ever location that the user inputs eg: India,United States"
            },
            gl : {
              type: "string",
              description: "Convert the location user provided to two letter code in small letters eg: India to 'in' and United States to 'us' " 
            }
          },
          required: ["q","location","gl"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "search_trends",
        description: "Use Google trends api to show the trends for what user has inputted",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "The query user wants to search in google trends, whatever input user wants to search in trends eg: Coffee, Mango, Milk",
            },
          },
          required: ["q"],
        },
      },
    }
  ];

  /* const assistant = await openai.beta.assistants.create({
    name: "TextAI Assistant 3",
    instructions: "You are a master at using serpapi, which uses Google Search, Google Trends, Google Reviews API to fetch the data as provided by the user, convey every details to user in detail and do not make up any information.",
    model: "gpt-3.5-turbo",
    tools: tools
  }); */

  const assistant = await openai.beta.assistants.update("asst_oNyeuXCAkgHbDbqOTwnL2vng", {
    name: "TextAI Assistant 3",
    instructions: "You are a master at using serpapi, which uses Google Search, Google Trends, Google Reviews API to fetch the data as provided by the user, convey the structured data into readable data and do not include unwanted symbols in text and don't provide hallucinated data ask user to input missing data if",
    model: "gpt-3.5-turbo-0125",
    tools: tools
  });

  console.log(assistant);
}

createAssistant();

