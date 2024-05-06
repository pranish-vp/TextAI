const express = require("express");
const cors = require('cors');
require("dotenv").config();
const OpenAI = require("openai");
const axios = require('axios');
const { MongoClient } = require('mongodb');
/* const { semanticSearch } = require('./semanticsearch');
 */

const uri = process.env.MONGODB_URI;
const dbName = 'textai';
const client = new MongoClient(uri);
async function insertData(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('history');
    await collection.insertOne(data);
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
  } finally {
    await client.close();
  }
}

let globembed;

const app = express();
app.use(express.json());
app.use(cors());

async function summarizeText(userprompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ "role": "system", "content": "Summarize this text in a single line" },
    { "role": "user", "content": userprompt }],
    max_tokens: 25,
  });
  return JSON.stringify({ 'userprompt': userprompt, 'response': response.choices[0].message.content });

}
async function completeText(userprompt) {
  console.log(userprompt);
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ "role": "system", "content": "Complete this text in a single line include the user prompt at the beginning and start from there" },
    { "role": "user", "content": userprompt }],
    max_tokens: 25,
  });
  return JSON.stringify({ 'userprompt': userprompt, 'response': response.choices[0].message.content });

}
async function answerText(userprompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ "role": "system", "content": "Answer any questions in this text in a single line" },
    { "role": "user", "content": userprompt }],
    max_tokens: 25,
  });
  return JSON.stringify({ 'userprompt': userprompt, 'response': response.choices[0].message.content });
}

async function embedText(userprompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      "input": userprompt,
      "model": "text-embedding-3-small"
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPEN_AI_KEY}`
      }
    }
  );
  const embeddata = response.data.data[0].embedding.join();;
  globembed = embeddata;
  return "Embedded sucessfully check below";

}


const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

app.post('/', async (req, res) => {
  globembed=null;

  const userPrompt = req.body.userPrompt;

  let lastResponse;

  const system_prompt = `You are a helpful personal assistant.\n\n` +
    `# Tools\n` +
    `You have the following tools that you can invoke based on the user inquiry.\n` +
    `- summarize_text, when the user wants to know the weather forecast given a location and date.\n` +
    `- complete_text, when the user wants to know events happening in a given location and date.\n` +
    `- answer_text, when the user wants to know more about a particular event.\n` +
    `- embed_text, when the user wants to search for hotel based on given location.\n` +
    `When you fill up some of the required information yourself, be sure to confirm to user before proceeding.\n` +
    `Aside from the listed functions above, answer all other inquiries by telling the user that it is out of scope of your ability.\n\n` +
    `# User\n` +
    `If futher details needed, please ask me for it.\n\n` +
    `Don't add extra asterisks and text decorations, give result in plain text` +
    `# Language Support\n` +
    `Please reply in the language used by the user.\n\n`


  messages = [
    { role: "user", content: userPrompt }
  ];
  messages.push({ role: "system", content: "Only provide answers in short manner and do not add any other texts, only ask the user for guidance when there is errors in inputs" + " Dont add * or # anything like that" });
  const tools = [
    {
      type: "function",
      function: {
        name: "summarize_text",
        description: "Summarize user text into a single line",
        parameters: {
          type: "object",
          properties: {
            userprompt: {
              type: "string",
              description: "Whatever text the user inputs, e.g. an article about artificial intelligence",
            },
          },
          required: ["userprompt"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "complete_text",
        description: "Complete the text inputed by user by generating text after what user has written.",
        parameters: {
          type: "object",
          properties: {
            userprompt: {
              type: "string",
              description: "Whatever text the user inputs, e.g. Peter walks down the road and saw ",
            },
          },
          required: ["userprompt"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "answer_text",
        description: "Answer the question inputted by the user",
        parameters: {
          type: "object",
          properties: {
            userprompt: {
              type: "string",
              description: "Whatever text the user inputs, e.g. Who is the president of america? ",
            },
          },
          required: ["userprompt"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "embed_text",
        description: "Using the open ai text embeddings, generate vector embeddings for the user input",
        parameters: {
          type: "object",
          properties: {
            userprompt: {
              type: "string",
              description: "Whatever text the user inputs, e.g. Cat ",
            },
          },
          required: ["userprompt"],
        },
      },
    },
  ];



  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: messages,
    tools: tools,
    tool_choice: "auto", // auto is default, but we'll be explicit
  });

  lastResponse = response.choices[0].message.content;
  const responseMessage = response.choices[0].message;



  let toolCalls = responseMessage.tool_calls;
  if (responseMessage.tool_calls) {
    messages.push(responseMessage);
    const availableFunctions = {
      summarize_text: summarizeText,
      complete_text: completeText,
      answer_text: answerText,
      embed_text: embedText,
    };

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      let functionResponse = await functionToCall(
        functionArgs.userprompt
      );

      console.log(functionName);
      if (functionName == 'embed_data') {
        functionResponse = "Embedded successfully check below";

      }
      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: functionResponse,
      });
    }
  }

  const secondResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: messages,
    tools: tools,
  });

  lastResponse = secondResponse.choices[0].message.content;
  if (globembed) {
    lastResponse += `\nEmbed Output : ${globembed}`
  }

  /* Inserting into mongodb */
  await insertData({
    inputData: userPrompt,
    output: lastResponse,
    timestamp: new Date()
  });

  res.json({ lastResponse });

})

/* app.post('/ss', async (req, res) => {
  const userPrompt = req.body.userPrompt;
  const msg = await semanticSearch(userPrompt);
  res.json(msg);
}); */

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server started on port ${port}`));
module.exports = app;

//Old Method
/* app.post('/summarize', async(req,res)=>{

  const userPrompt = req.body.userPrompt;
  const response= await openai.chat.completions.create({
    model : 'gpt-3.5-turbo',
    messages : [{"role": "system", "content": "Summarize this text in short, make it really short within single line"},
                {"role":"user", "content" : userPrompt}],
    max_tokens:50,
  });
  const completedText= response.choices[0].message.content;
  console.log(completedText);


  await insertData({
    inputData: userPrompt,
    selectedButton: 'Summarize Text',
    output: completedText,
    timestamp: new Date()
  });

  res.json({ completedText });

})

app.post('/answer', async(req,res)=>{

  const userPrompt = req.body.userPrompt;
  const response= await openai.chat.completions.create({
    model : 'gpt-3.5-turbo',
    messages : [{"role": "system", "content": "Answer this question with a short answer possible"},
                {"role":"user", "content" : userPrompt}],
    max_tokens:20,
  });
  const completedText= response.choices[0].message.content;
  console.log(completedText);


  await insertData({
    inputData: userPrompt,
    selectedButton: 'Answer Text',
    output: completedText,
    timestamp: new Date()
  });

  res.json({ completedText });

  
})

app.post('/embedtext', async(req,res)=>{

  const userPrompt = req.body.userPrompt;
  console.log(userPrompt);
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      "input": userPrompt,
      "model": "text-embedding-3-small"
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPEN_AI_KEY}`
      }
    }
  );
  const embeddata = response.data.data[0].embedding.join();;
  console.log(embeddata);

  await insertData({
    inputData: userPrompt,
    selectedButton: 'Embed Text',
    output: embeddata,
    timestamp: new Date()
  });

  res.json({ embeddata });

  
}) */

